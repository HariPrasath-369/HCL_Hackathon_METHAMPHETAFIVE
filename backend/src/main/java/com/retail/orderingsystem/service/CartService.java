package com.retail.orderingsystem.service;

import com.retail.orderingsystem.entity.Cart;
import com.retail.orderingsystem.entity.User;

public interface CartService {
    Cart getCartByUser(User user);
    Cart addToCart(User user, Long productId, Integer quantity);
    Cart updateCartItem(User user, Long cartItemId, Integer quantity);
    Cart removeCartItem(User user, Long cartItemId);
    void clearCart(User user);
}
