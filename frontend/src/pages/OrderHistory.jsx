import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CartContext } from '../context/CartContext';
import { RefreshCcw, CheckCircle, PackageOpen } from 'lucide-react';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reorderingId, setReorderingId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchCart } = useContext(CartContext);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/history');
            setOrders(response.data);
        } catch (err) {
            console.error("Failed to fetch order history", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleReorder = async (orderId) => {
        setReorderingId(orderId);
        try {
            await api.post(`/orders/reorder/${orderId}`);
            await fetchCart();
            navigate('/cart');
        } catch (err) {
            console.error("Reorder failed", err);
            alert("Failed to reorder. Items might be out of stock.");
        }
        setReorderingId(null);
    };

    const handleConfirmReceipt = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/complete`);
            fetchOrders();
        } catch (err) {
            const serverMessage = err.response?.data?.message || err.message;
            alert("Failed to confirm receipt:\n" + serverMessage);
            console.error(err);
        }
    };

    if (loading) return <div className="page-container loader">Loading order history...</div>;

    return (
        <div className="page-container orders-page">
            <div className="page-header">
                <h1>My Orders</h1>
                <p className="text-light">View your past orders and easily reorder your favorites.</p>
            </div>

            {location.state?.success && (
                <div className="alert alert-success" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', border: '1px solid #4ade80' }}>
                    <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Order confirmed and payment successful! You will receive an email shortly.
                </div>
            )}

            {orders.length === 0 ? (
                <div className="empty-state">
                    <PackageOpen size={48} className="text-light mb-2" />
                    <h3>No orders yet</h3>
                    <p>When you place an order, it will appear here.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card card">
                            <div className="order-header">
                                <div>
                                    <span className="order-id">Order #{order.id}</span>
                                    <span className="order-date">
                                        {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className={`order-status-badge ${order.status === 'COMPLETED' ? 'badge-primary' : 'badge-secondary'}`}>
                                    {order.status}
                                </div>
                            </div>
                            
                            <div className="order-items">
                                {order.items.map(item => (
                                    <div key={item.id} className="order-item-row">
                                        <span>{item.quantity}x {item.product.name}</span>
                                        <span>${(item.priceAtTimeOfOrder * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="order-footer">
                                <div className="order-total">
                                    Total: <strong>${order.totalAmount.toFixed(2)}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        className="btn btn-secondary btn-outline"
                                        onClick={() => handleReorder(order.id)}
                                        disabled={reorderingId === order.id}
                                    >
                                        <RefreshCcw size={16} className={reorderingId === order.id ? 'spin' : ''} style={{marginRight: '8px'}} />
                                        Quick Reorder
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
