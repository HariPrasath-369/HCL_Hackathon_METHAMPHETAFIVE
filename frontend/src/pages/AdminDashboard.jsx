import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Plus, Edit2, Trash2, ShoppingCart, Users, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('PRODUCTS');
    const [products, setProducts] = useState([]);
    const [stockFilter, setStockFilter] = useState('ALL');
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', category: 'PIZZA', brand: '', packageType: '', 
        price: '', description: '', imageUrl: '', stock: 0, minStockWarning: 5, isActive: true
    });

    const fetchData = async () => {
        try {
            if (activeTab === 'PRODUCTS' || activeTab === 'INVENTORY') {
                const response = await api.get('/products');
                setProducts(response.data);
            } else if (activeTab === 'ORDERS') {
                const response = await api.get('/orders/all');
                setOrders(response.data);
            } else if (activeTab === 'USERS') {
                const response = await api.get('/users/all');
                setUsers(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleEdit = (product) => {
        setFormData(product);
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                fetchData();
            } catch(err) {
                alert("Failed to delete product");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setShowForm(false);
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert("Failed to save product");
        }
    };

    const handleStockUpdate = async (id, newStock) => {
        try {
            await api.put(`/inventory/update/${id}`, { stock: parseInt(newStock) });
            fetchData();
        } catch(err) {
            alert("Failed to update inventory");
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status });
            fetchData();
        } catch(err) {
            const serverMessage = err.response?.data?.message || err.message;
            alert("Failed to update order status:\n" + serverMessage);
            console.error(err);
        }
    };

    return (
        <div className="page-container admin-page">
            <div className="admin-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p className="text-light">Manage products, inventory, and orders.</p>
                </div>
                
                <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button 
                        className={`btn ${activeTab === 'PRODUCTS' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('PRODUCTS')}
                    >
                        <Package size={18} style={{marginRight: '8px'}} /> Products
                    </button>
                    <button 
                        className={`btn ${activeTab === 'INVENTORY' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('INVENTORY')}
                    >
                        <AlertTriangle size={18} style={{marginRight: '8px'}} /> Inventory
                    </button>
                    <button 
                        className={`btn ${activeTab === 'ORDERS' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('ORDERS')}
                    >
                        <ShoppingCart size={18} style={{marginRight: '8px'}} /> Orders
                    </button>
                    <button 
                        className={`btn ${activeTab === 'USERS' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('USERS')}
                    >
                        <Users size={18} style={{marginRight: '8px'}} /> Users
                    </button>
                </div>

                {activeTab === 'PRODUCTS' && (
                    <button 
                        className="btn btn-primary mt-3"
                        onClick={() => {
                            setFormData({name: '', category: 'PIZZA', brand: '', packageType: '', price: '', description: '', imageUrl: '', stock: 0, minStockWarning: 5, isActive: true});
                            setEditingId(null);
                            setShowForm(!showForm);
                        }}
                    >
                        <Plus size={18} style={{marginRight: '8px'}} />
                        {showForm ? 'Cancel' : 'Add New Product'}
                    </button>
                )}
            </div>

            {activeTab === 'PRODUCTS' && showForm && (
                <div className="card admin-form-card mb-4">
                    <h3>{editingId ? 'Edit Product' : 'Create New Product'}</h3>
                    <form onSubmit={handleSubmit} className="product-form grid-form">
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                                <option value="PIZZA">Pizza</option>
                                <option value="COLD_DRINK">Cold Drink</option>
                                <option value="BREAD">Bread</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Brand</label>
                            <input type="text" name="brand" className="form-control" value={formData.brand} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Package Type</label>
                            <input type="text" name="packageType" className="form-control" value={formData.packageType} onChange={handleChange} placeholder="e.g. Large, Can, 2-Pack" />
                        </div>
                        <div className="form-group">
                            <label>Price ($)</label>
                            <input type="number" step="0.01" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Stock Quantity</label>
                            <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleChange} required />
                        </div>
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="2"></textarea>
                        </div>
                        <div className="form-group full-width">
                            <label>Image URL (Optional)</label>
                            <input type="text" name="imageUrl" className="form-control" value={formData.imageUrl} onChange={handleChange} />
                        </div>
                        <div className="form-actions full-width">
                            <button type="submit" className="btn btn-primary">Save Product</button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'PRODUCTS' && (
                <div className="card table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category & Brand</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <strong>{product.name}</strong><br/>
                                        <small className="text-light">{product.packageType}</small>
                                    </td>
                                    <td>
                                        <span className="badge badge-secondary">{product.category}</span>
                                        {product.brand && <span className="badge badge-secondary ml-1">{product.brand}</span>}
                                    </td>
                                    <td>${parseFloat(product.price).toFixed(2)}</td>
                                    <td>
                                        <div className="stock-control">
                                            <input 
                                                type="number" 
                                                className={`form-control small ${product.stock <= product.minStockWarning ? 'border-danger text-danger' : ''}`}
                                                defaultValue={product.stock}
                                                onBlur={(e) => {
                                                    if(e.target.value !== String(product.stock)) {
                                                        handleStockUpdate(product.id, e.target.value);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn-icon" onClick={() => handleEdit(product)}><Edit2 size={16} /></button>
                                        <button className="btn-icon text-danger" onClick={() => handleDelete(product.id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'INVENTORY' && (
                <div className="card table-container">
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <strong style={{ marginRight: '10px' }}>Filter by Stock Level:</strong>
                        <button className={`btn ${stockFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStockFilter('ALL')}>All Products</button>
                        <button className={`btn ${stockFilter === '50' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStockFilter('50')}>{'< 50 Items'}</button>
                        <button className={`btn ${stockFilter === '20' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStockFilter('20')}>{'< 20 Items'}</button>
                        <button className={`btn ${stockFilter === '10' ? 'btn-primary text-danger border-danger' : 'btn-outline text-danger border-danger'}`} onClick={() => setStockFilter('10')}>{'< 10 Items (Critical)'}</button>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Update Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products
                                .filter(p => {
                                    if (stockFilter === 'ALL') return true;
                                    return p.stock < parseInt(stockFilter);
                                })
                                .sort((a, b) => a.stock - b.stock)
                                .map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <strong>{product.name}</strong><br/>
                                        <small className="text-light">{product.packageType}</small>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>
                                        {product.stock <= 10 ? (
                                            <span className="badge badge-primary" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>CRITICAL ({product.stock})</span>
                                        ) : product.stock <= 20 ? (
                                            <span className="badge badge-secondary" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>LOW ({product.stock})</span>
                                        ) : (
                                            <span className="badge badge-secondary" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>OK ({product.stock})</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="stock-control" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input 
                                                type="number" 
                                                className={`form-control small ${product.stock <= product.minStockWarning ? 'border-danger text-danger' : ''}`}
                                                defaultValue={product.stock}
                                                id={`stock-input-${product.id}`}
                                            />
                                            <button 
                                                className="btn btn-primary small"
                                                onClick={() => {
                                                    const val = document.getElementById(`stock-input-${product.id}`).value;
                                                    handleStockUpdate(product.id, val);
                                                }}
                                            >Update</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'ORDERS' && (
                <div className="card table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        #{order.id}<br/>
                                        <small className="text-light">{new Date(order.orderDate).toLocaleDateString()}</small>
                                    </td>
                                    <td>
                                        <strong>{order.user?.name || 'N/A'}</strong><br/>
                                        <small className="text-light">{order.user?.email || 'N/A'}</small>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            {order.items?.map(item => (
                                                <div key={item.id}>{item.quantity}x {item.product?.name}</div>
                                            ))}
                                        </div>
                                    </td>
                                    <td>${parseFloat(order.totalAmount).toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${order.status === 'CONFIRMED' ? 'badge-primary' : 'badge-secondary'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-light" style={{ fontSize: '0.85rem' }}>Order Logged</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'USERS' && (
                <div className="card table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Phone Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{user.phoneNumber || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
