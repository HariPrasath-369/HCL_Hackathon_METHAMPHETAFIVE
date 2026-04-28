package com.retail.orderingsystem.service.impl;

import com.retail.orderingsystem.entity.*;
import com.retail.orderingsystem.repository.OrderRepository;
import com.retail.orderingsystem.repository.ProductRepository;
import com.retail.orderingsystem.service.CartService;
import com.retail.orderingsystem.service.EmailService;
import com.retail.orderingsystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public Order placeOrder(User user) {
        throw new UnsupportedOperationException("Legacy placeOrder is disabled. Use confirmOrderAfterPayment.");
    }

    @Override
    @Transactional
    public Order confirmOrderAfterPayment(User user, String paymentIntentId) {
        Cart cart = cartService.getCartByUser(user);

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Please add at least one item to place an order");
        }

        // Ideally, we would verify the paymentIntentId with Stripe API here to ensure
        // it 'succeeded'
        // For example: PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        // if (!"succeeded".equals(intent.getStatus())) { throw new
        // RuntimeException("Payment not successful"); }

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .totalAmount(cart.getTotalAmount())
                .status(OrderStatus.CONFIRMED)
                .paymentIntentId(paymentIntentId)
                .paymentStatus("succeeded")
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Only " + product.getStock() + " items left in stock for " + product.getName());
            }

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .priceAtTimeOfOrder(product.getPrice())
                    .build();

            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(user);

        // Fire email asynchronously or inline
        emailService.sendOrderConfirmation(savedOrder);

        return savedOrder;
    }

    @Override
    @Transactional
    public Order confirmCodOrder(User user) {
        Cart cart = cartService.getCartByUser(user);

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Please add at least one item to place an order");
        }

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .totalAmount(cart.getTotalAmount())
                .status(OrderStatus.CONFIRMED)
                .paymentIntentId("COD")
                .paymentStatus("COD")
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Only " + product.getStock() + " items left in stock for " + product.getName());
            }

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .priceAtTimeOfOrder(product.getPrice())
                    .build();

            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(user);

        emailService.sendOrderConfirmation(savedOrder);

        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrderHistory(User user) {
        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        orders.forEach(o -> {
            o.getItems().size();
            if (o.getUser() != null)
                o.getUser().getName();
        });
        return orders;
    }

    @Override
    public Order getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.getItems().size();
        if (order.getUser() != null)
            order.getUser().getName();
        return order;
    }

    @Override
    @Transactional
    public Order reorder(User user, Long orderId) {
        Order oldOrder = getOrderById(orderId);

        if (!oldOrder.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to reorder this order");
        }

        // Add items to cart
        for (OrderItem item : oldOrder.getItems()) {
            cartService.addToCart(user, item.getProduct().getId(), item.getQuantity());
        }

        // Return null since we shouldn't automatically place the order with Stripe flow
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        orders.forEach(o -> {
            o.getItems().size();
            if (o.getUser() != null)
                o.getUser().getName();
        });
        return orders;
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        savedOrder.getItems().size(); // Force initialization of lazy items
        if (savedOrder.getUser() != null)
            savedOrder.getUser().getName(); // Force initialization of user proxy

        // Notify user of status change
        emailService.sendStatusUpdate(savedOrder);

        return savedOrder;
    }
}
