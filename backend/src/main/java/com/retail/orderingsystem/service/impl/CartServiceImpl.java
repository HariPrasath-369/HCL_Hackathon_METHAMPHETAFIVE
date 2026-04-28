package com.retail.orderingsystem.service.impl;

import com.retail.orderingsystem.entity.Cart;
import com.retail.orderingsystem.entity.CartItem;
import com.retail.orderingsystem.entity.Product;
import com.retail.orderingsystem.entity.User;
import com.retail.orderingsystem.repository.CartItemRepository;
import com.retail.orderingsystem.repository.CartRepository;
import com.retail.orderingsystem.repository.ProductRepository;
import com.retail.orderingsystem.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public Cart getCartByUser(User user) {
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = Cart.builder().user(user).totalAmount(BigDecimal.ZERO).build();
            return cartRepository.save(newCart);
        });
    }

    @Override
    @Transactional
    public Cart addToCart(User user, Long productId, Integer quantity) {
        Cart cart = getCartByUser(user);
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        if (cart.getItems() == null) {
            cart.setItems(new java.util.ArrayList<>());
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }
        
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        int newQuantity = existingItem.map(item -> item.getQuantity() + quantity).orElse(quantity);
        
        if (newQuantity > product.getStock()) {
            throw new IllegalArgumentException("Cannot add more than available stock (" + product.getStock() + ")");
        }

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(newQuantity);
        } else {
            CartItem newItem = CartItem.builder().cart(cart).product(product).quantity(quantity).build();
            cart.getItems().add(newItem);
        }

        recalculateTotal(cart);
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart updateCartItem(User user, Long cartItemId, Integer quantity) {
        Cart cart = getCartByUser(user);
        CartItem item = cartItemRepository.findById(cartItemId).orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item does not belong to user's cart");
        }

        if (quantity <= 0) {
            return removeCartItem(user, cartItemId);
        }
        
        if (quantity > item.getProduct().getStock()) {
            throw new IllegalArgumentException("Only " + item.getProduct().getStock() + " items left in stock");
        }

        item.setQuantity(quantity);
        recalculateTotal(cart);
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart removeCartItem(User user, Long cartItemId) {
        Cart cart = getCartByUser(user);
        cart.getItems().removeIf(item -> item.getId().equals(cartItemId));
        recalculateTotal(cart);
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(User user) {
        Cart cart = getCartByUser(user);
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
    }

    private void recalculateTotal(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalAmount(total);
    }
}
