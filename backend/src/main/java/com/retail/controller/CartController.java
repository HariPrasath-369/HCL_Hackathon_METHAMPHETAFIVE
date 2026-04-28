package com.retail.orderingsystem.controller;

import com.retail.orderingsystem.entity.Cart;
import com.retail.orderingsystem.entity.User;
import com.retail.orderingsystem.repository.UserRepository;
import com.retail.orderingsystem.security.UserDetailsImpl;
import com.retail.orderingsystem.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        return ResponseEntity.ok(cartService.getCartByUser(getCurrentUser()));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf(payload.get("productId").toString());
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        return ResponseEntity.ok(cartService.addToCart(getCurrentUser(), productId, quantity));
    }

    @PutMapping("/update")
    public ResponseEntity<Cart> updateCartItem(@RequestBody Map<String, Object> payload) {
        Long cartItemId = Long.valueOf(payload.get("cartItemId").toString());
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        return ResponseEntity.ok(cartService.updateCartItem(getCurrentUser(), cartItemId, quantity));
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Cart> removeCartItem(@PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeCartItem(getCurrentUser(), cartItemId));
    }
}
