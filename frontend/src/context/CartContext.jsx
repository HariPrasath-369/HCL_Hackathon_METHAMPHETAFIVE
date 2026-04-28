import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const { user } = useContext(AuthContext);

    const fetchCart = async () => {
        if (user) {
            try {
                const response = await api.get('/cart');
                setCart(response.data);
            } catch (err) {
                console.error("Failed to fetch cart", err);
            }
        } else {
            setCart(null);
        }
    };

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const addToCart = async (productId, quantity) => {
        await api.post('/cart/add', { productId, quantity });
        fetchCart();
    };

    const updateCartItem = async (cartItemId, quantity) => {
        await api.put('/cart/update', { cartItemId, quantity });
        fetchCart();
    };

    const removeCartItem = async (cartItemId) => {
        await api.delete(`/cart/remove/${cartItemId}`);
        fetchCart();
    };

    const clearCartLocal = () => {
        setCart(null);
    }

    return (
        <CartContext.Provider value={{ cart, addToCart, updateCartItem, removeCartItem, fetchCart, clearCartLocal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
