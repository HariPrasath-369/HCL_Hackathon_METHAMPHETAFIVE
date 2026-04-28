import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Loader } from 'lucide-react';

const Cart = () => {
    const { cart, updateCartItem, removeCartItem } = useContext(CartContext);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [cartError, setCartError] = useState(null);
    const navigate = useNavigate();

    const handleCheckout = () => {
        setPlacingOrder(true);
        // Navigate to the Stripe Checkout page
        navigate('/checkout');
    };

    const handleUpdateQuantity = async (itemId, currentQty, increment) => {
        setCartError(null);
        try {
            await updateCartItem(itemId, currentQty + increment);
        } catch (err) {
            setCartError(err.response?.data?.message || "Cannot update quantity");
        }
    };

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="page-container empty-cart-container">
                <ShoppingBag size={64} className="text-light" />
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any delicious items yet.</p>
                <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="page-container cart-page">
            <h1>Shopping Cart</h1>
            
            {cartError && (
                <div className="alert alert-danger mb-4" style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', border: '1px solid #f87171' }}>
                    {cartError}
                </div>
            )}

            <div className="cart-layout">
                <div className="cart-items-list">
                    {cart.items.map(item => (
                        <div key={item.id} className="cart-item card">
                            <div className="cart-item-info">
                                <h3>{item.product.name}</h3>
                                <p className="text-light">{item.product.packageType}</p>
                            </div>
                            
                            <div className="cart-item-actions">
                                <div className="quantity-controls">
                                    <button 
                                        className="qty-btn"
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                        disabled={item.quantity <= 1}
                                    >-</button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button 
                                        className="qty-btn"
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                        disabled={item.quantity >= item.product.stock}
                                    >+</button>
                                </div>
                                
                                <span className="item-price">
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </span>
                                
                                <button 
                                    className="btn-icon text-danger"
                                    onClick={() => removeCartItem(item.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="cart-summary card">
                    <h3>Order Summary</h3>
                    
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>${cart.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Taxes & Fees</span>
                        <span>${(cart.totalAmount * 0.1).toFixed(2)}</span>
                    </div>
                    
                    <div className="summary-row total-row">
                        <span>Total</span>
                        <span>${(cart.totalAmount * 1.1).toFixed(2)}</span>
                    </div>
                    
                    <button 
                        className="btn btn-primary full-width checkout-btn"
                        onClick={handleCheckout}
                        disabled={placingOrder}
                    >
                        {placingOrder ? (
                            <><Loader size={18} className="spinner" style={{ marginRight: '8px' }} /> Processing...</>
                        ) : (
                            <>Proceed to Checkout <ArrowRight size={18} style={{ marginLeft: '8px' }} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
