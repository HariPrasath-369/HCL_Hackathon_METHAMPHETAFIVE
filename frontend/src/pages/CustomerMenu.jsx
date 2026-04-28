import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Search, Filter } from 'lucide-react';

const CustomerMenu = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = '/products';
                if (filterCategory) {
                    url += `?category=${filterCategory}`;
                }
                const response = await api.get(url);
                setProducts(response.data);
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
            setLoading(false);
        };

        fetchProducts();
    }, [filterCategory]);

    return (
        <div className="page-container menu-page">
            <div className="menu-header">
                <div>
                    <h1>Our Menu</h1>
                    <p className="text-light">Discover our delicious pizzas, refreshing drinks, and fresh breads.</p>
                </div>
                
                <div className="filter-controls">
                    <div className="search-box">
                        <Filter size={18} className="search-icon" />
                        <select 
                            className="form-control"
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="PIZZA">Pizza Specials</option>
                            <option value="COLD_DRINK">Cold Drinks</option>
                            <option value="BREAD">Breads & Sides</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loader">Loading menu...</div>
            ) : (
                <div className="product-grid">
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No products found in this category.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerMenu;
