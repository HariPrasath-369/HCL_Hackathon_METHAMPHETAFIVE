package com.retail.orderingsystem.service;

import com.retail.orderingsystem.entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderConfirmation(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Confirmation - Order #" + order.getId());
            
            String htmlContent = "<h2>Thank you for your order!</h2>"
                    + "<p>Hi " + order.getUser().getName() + ",</p>"
                    + "<p>Your order #" + order.getId() + " has been confirmed.</p>"
                    + "<p><strong>Total Amount:</strong> $" + order.getTotalAmount() + "</p>"
                    + "<h3>Order Details:</h3>"
                    + "<ul>";
                    
            for (var item : order.getItems()) {
                htmlContent += "<li>" + item.getProduct().getName() + " (x" + item.getQuantity() + ") - $" + item.getPriceAtTimeOfOrder() + "</li>";
            }
            
            htmlContent += "</ul>"
                    + "<p>We will notify you once it's out for delivery.</p>";
                    
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email to " + order.getUser().getEmail() + ": " + e.getMessage());
            // We catch the exception so that if the mock credentials fail, it doesn't crash the order process
        } catch (Exception e) {
            System.err.println("Email configuration error: " + e.getMessage());
        }
    }

    public void sendStatusUpdate(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Status Update - Order #" + order.getId());
            
            String statusTitle = "Your order is " + order.getStatus().toString().replace("_", " ");
            String statusMsg = "";
            
            if (order.getStatus() == com.retail.orderingsystem.entity.OrderStatus.CONFIRMED) {
                statusMsg = "We have accepted your order and are preparing it.";
            } else if (order.getStatus() == com.retail.orderingsystem.entity.OrderStatus.OUT_FOR_DELIVERY) {
                statusMsg = "Good news! Your order is on its way and will reach you shortly.";
            } else if (order.getStatus() == com.retail.orderingsystem.entity.OrderStatus.DELIVERED) {
                statusMsg = "Your order has been delivered. Please confirm receipt on your dashboard.";
            }
            
            String htmlContent = "<h2>" + statusTitle + "</h2>"
                    + "<p>Hi " + order.getUser().getName() + ",</p>"
                    + "<p>" + statusMsg + "</p>"
                    + "<p><strong>Order ID:</strong> #" + order.getId() + "</p>"
                    + "<p>Thank you for shopping with us!</p>";
                    
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send status update email: " + e.getMessage());
        }
    }
}
