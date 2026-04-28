package com.retail.orderingsystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSendException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.warn("IllegalArgumentException: {}", ex.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MessagingException.class)
    public ResponseEntity<Map<String, String>> handleMessagingException(MessagingException ex) {
        logger.error("Email sending failed - MessagingException: {}", ex.getMessage(), ex);
        Map<String, String> response = new HashMap<>();
        response.put("error", "Email service temporarily unavailable");
        response.put("message", "Failed to send email notification. Your order has been placed successfully.");
        response.put("details", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @ExceptionHandler(MailSendException.class)
    public ResponseEntity<Map<String, String>> handleMailSendException(MailSendException ex) {
        logger.error("Email sending failed - MailSendException: {}", ex.getMessage(), ex);
        Map<String, String> response = new HashMap<>();
        response.put("error", "Email service error");
        response.put("message", "Unable to send email at this moment. Order is confirmed but notification failed.");
        response.put("details", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    // @ExceptionHandler(IllegalStateException.class)
    // public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException ex) {
    //     logger.error("IllegalStateException: {}", ex.getMessage(), ex);
    //     Map<String, String> response = new HashMap<>();
    //     response.put("error", "Invalid operation state");
    //     response.put("message", ex.getMessage());
    //     return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    // }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        logger.error("RuntimeException: {}", ex.getMessage(), ex);

        Map<String, String> response = new HashMap<>();
        response.put("error", "Internal server error");
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        logger.error("Unexpected exception: {}", ex.getMessage(), ex);
        Map<String, String> response = new HashMap<>();
        response.put("error", "An unexpected error occurred");
        response.put("message", "Please try again later");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
