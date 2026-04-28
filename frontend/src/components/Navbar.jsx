import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, LogOut, Package, UserCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartItemsCount = cart?.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <Package className="brand-icon" />
                    <span>RetailOrders</span>
                </Link>
            </div>
            
            <div className="navbar-links">
                {user ? (
                    <>
                        <span className="welcome-text">
                            <UserCircle size={20} />
                            Welcome, {user.name}
                        </span>
                        
                        {user.role === 'ROLE_CUSTOMER' && (
                            <>
                                <Link to="/" className="nav-link">Menu</Link>
                                <Link to="/orders" className="nav-link">My Orders</Link>
                                <Link to="/cart" className="nav-link cart-link">
                                    <ShoppingCart size={20} />
                                    {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
                                </Link>
                            </>
                        )}
                        
                        {user.role === 'ROLE_ADMIN' && (
                            <Link to="/admin" className="nav-link">Dashboard</Link>
                        )}
                        
                        <button onClick={handleLogout} className="btn-logout">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn btn-primary">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
