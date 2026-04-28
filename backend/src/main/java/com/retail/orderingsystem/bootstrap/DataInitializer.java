package com.retail.orderingsystem.bootstrap;

import com.retail.orderingsystem.entity.Category;
import com.retail.orderingsystem.entity.Product;
import com.retail.orderingsystem.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final ProductRepository productRepository;

        @Override
        public void run(String... args) throws Exception {
                if (productRepository.count() == 0) {
                        System.out.println("No products found, initializing dummy data...");

                        Product p1 = Product.builder()
                                        .name("Classic Margherita")
                                        .category(Category.PIZZA)
                                        .brand("House Special")
                                        .packageType("Medium 12-inch")
                                        .price(new BigDecimal("12.99"))
                                        .description("Fresh mozzarella, tomato sauce, and basil on a hand-tossed crust.")
                                        .imageUrl("https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80")
                                        .stock(50)
                                        .minStockWarning(10)
                                        .isActive(true)
                                        .build();

                        Product p2 = Product.builder()
                                        .name("Pepperoni Feast")
                                        .category(Category.PIZZA)
                                        .brand("House Special")
                                        .packageType("Large 16-inch")
                                        .price(new BigDecimal("16.99"))
                                        .description("Loaded with premium pepperoni and extra cheese.")
                                        .imageUrl("https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80")
                                        .stock(40)
                                        .minStockWarning(5)
                                        .isActive(true)
                                        .build();

                        Product p3 = Product.builder()
                                        .name("Coca-Cola")
                                        .category(Category.COLD_DRINK)
                                        .brand("Coca-Cola")
                                        .packageType("330ml Can")
                                        .price(new BigDecimal("1.99"))
                                        .description("Chilled classic Coke.")
                                        .imageUrl("https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80")
                                        .stock(100)
                                        .minStockWarning(20)
                                        .isActive(true)
                                        .build();

                        Product p4 = Product.builder()
                                        .name("Sprite")
                                        .category(Category.COLD_DRINK)
                                        .brand("Coca-Cola")
                                        .packageType("2L Bottle")
                                        .price(new BigDecimal("3.49"))
                                        .description("Crisp, refreshing, clean-tasting Sprite.")
                                        .imageUrl("https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&q=80")
                                        .stock(30)
                                        .minStockWarning(10)
                                        .isActive(true)
                                        .build();

                        Product p5 = Product.builder()
                                        .name("Garlic Bread")
                                        .category(Category.BREAD)
                                        .brand("Oven Fresh")
                                        .packageType("4 Pieces")
                                        .price(new BigDecimal("4.99"))
                                        .description("Warm, buttery garlic bread toasted to perfection.")
                                        .imageUrl("https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&q=80")
                                        .stock(60)
                                        .minStockWarning(15)
                                        .isActive(true)
                                        .build();

                        productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5));
                        System.out.println("Dummy products initialized successfully!");
                }
        }
}
