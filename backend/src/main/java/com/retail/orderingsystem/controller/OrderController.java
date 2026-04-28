package com.retail.orderingsystem.controller;

import com.retail.orderingsystem.entity.Order;
import com.retail.orderingsystem.entity.User;
import com.retail.orderingsystem.entity.Cart;
import com.retail.orderingsystem.entity.OrderStatus;
import com.retail.orderingsystem.repository.UserRepository;
import com.retail.orderingsystem.security.UserDetailsImpl;
import com.retail.orderingsystem.service.OrderService;
import com.retail.orderingsystem.service.PaymentService;
import com.retail.orderingsystem.service.CartService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent() {
        try {
            User user = getCurrentUser();
            Cart cart = cartService.getCartByUser(user);
            
            if (cart.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Cart is empty"));
            }

            PaymentIntent intent = paymentService.createPaymentIntent(cart.getTotalAmount());
            
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", intent.getClientSecret());
            response.put("paymentIntentId", intent.getId());
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Stripe Error: " + e.getMessage()));
        }
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> payload) {
        String paymentIntentId = payload.get("paymentIntentId");
        if (paymentIntentId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing paymentIntentId"));
        }
        
        try {
            Order order = orderService.confirmOrderAfterPayment(getCurrentUser(), paymentIntentId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/confirm-cod")
    public ResponseEntity<?> confirmCod() {
        try {
            Order order = orderService.confirmCodOrder(getCurrentUser());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Order>> getOrderHistory() {
        return ResponseEntity.ok(orderService.getOrderHistory(getCurrentUser()));
    }

    @PostMapping("/reorder/{orderId}")
    public ResponseEntity<Map<String, String>> reorder(@PathVariable Long orderId) {
        orderService.reorder(getCurrentUser(), orderId);
        return ResponseEntity.ok(Map.of("message", "Items added to cart. Please proceed to checkout."));
    }

    // --- Admin Endpoints --- //

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().build();
        }
        OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    @PutMapping("/{orderId}/complete")
    public ResponseEntity<Order> completeOrder(@PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        
        // Ensure the user owns this order
        if (!order.getUser().getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        
        // Ensure it's in DELIVERED state before completing
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Order cannot be marked completed unless it is delivered.");
        }
        
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, OrderStatus.COMPLETED));
    }
}
