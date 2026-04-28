import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerMenu from './pages/CustomerMenu';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import './index.css';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function AppRoutes() {
    
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Customer Routes */}
                    <Route path="/" element={
                        <ProtectedRoute requiredRole="ROLE_CUSTOMER">
                            <CustomerMenu />
                        </ProtectedRoute>
                    } />
                    <Route path="/cart" element={
                        <ProtectedRoute requiredRole="ROLE_CUSTOMER">
                            <Cart />
                        </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                        <ProtectedRoute requiredRole="ROLE_CUSTOMER">
                            <Checkout />
                        </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                        <ProtectedRoute requiredRole="ROLE_CUSTOMER">
                            <OrderHistory />
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="ROLE_ADMIN">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <AppRoutes />
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
