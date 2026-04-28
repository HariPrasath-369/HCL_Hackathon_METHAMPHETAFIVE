package com.retail.orderingsystem.repository;

import com.retail.orderingsystem.entity.Product;
import com.retail.orderingsystem.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(Category category);

    List<Product> findByBrand(String brand);

    List<Product> findByIsActiveTrue();
}
