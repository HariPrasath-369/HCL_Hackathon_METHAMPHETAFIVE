package com.retail.orderingsystem.service;

import com.retail.orderingsystem.entity.Category;
import com.retail.orderingsystem.entity.Product;

import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();
    Product getProductById(Long id);
    List<Product> getProductsByCategory(Category category);
    List<Product> getProductsByBrand(String brand);
    Product createProduct(Product product);
    Product updateProduct(Long id, Product product);
    void deleteProduct(Long id);
    Product updateInventory(Long productId, Integer newStock);
}
