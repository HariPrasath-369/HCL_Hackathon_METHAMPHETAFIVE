import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, Loader } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await addToCart(product.id, 1);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add to cart");
        }
        setIsAdding(false);
    };

    return (
        <div className="product-card card">
            <div className="product-image-container">
                <img 
                    src={product.imageUrl || `https://source.unsplash.com/400x300/?${product.category.toLowerCase()}`} 
                    alt={product.name} 
                    className="product-image"
                />
                {product.stock <= 0 && <span className="badge badge-danger out-of-stock">Out of Stock</span>}
                {product.stock > 0 && product.stock <= 5 && (
                    <span className="badge badge-warning low-stock">Only {product.stock} items left in stock</span>
                )}
            </div>
            
            <div className="product-details">
                <div className="product-header">
                    <h3 className="product-title">{product.name}</h3>
                    <span className="product-price">${product.price.toFixed(2)}</span>
                </div>
                
                <p className="product-desc">{product.description}</p>
                
                <div className="product-meta">
                    <span className="badge badge-secondary">{product.brand}</span>
                    <span className="badge badge-secondary">{product.packageType}</span>
                </div>

                <button 
                    className="btn btn-primary add-to-cart-btn"
                    disabled={product.stock <= 0 || isAdding}
                    onClick={handleAddToCart}
                >
                    {isAdding ? (
                        <Loader size={16} className="spinner" style={{ marginRight: '8px' }} />
                    ) : (
                        <ShoppingCart size={16} style={{ marginRight: '8px' }} />
                    )}
                    {product.stock > 0 ? (isAdding ? 'Adding...' : 'Add to Cart') : 'Sold Out'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
