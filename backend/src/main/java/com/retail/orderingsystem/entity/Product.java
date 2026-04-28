package com.retail.orderingsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    private String brand;
    private String packageType;

    @Column(nullable = false)
    private BigDecimal price;

    private String description;
    private String imageUrl;

    @Column(nullable = false)
    private Integer stock;

    private Integer minStockWarning;

    @Column(nullable = false)
    private Boolean isActive;
}
