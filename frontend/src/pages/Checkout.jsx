import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck } from 'lucide-react';

// Load Stripe (Using a mock test key for safety, though the user will use their own real one)
const stripePromise = loadStripe('pk_test_51SrB0pQnn0GdSHICQf45G5Yn8wS97YQ9m...'); 

const CheckoutForm = ({ paymentIntentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setIsProcessing(false);
      return;
    }

    // Confirm Payment
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        // Inform backend of success
        await axiosInstance.post('/orders/confirm-payment', { paymentIntentId });
        await fetchCart(); // Clear cart in UI
        navigate('/orders', { state: { success: true } });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to confirm order with server');
      }
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h3>Payment Details</h3>
      <PaymentElement />
      {error && <div className="error-message">{error}</div>}
      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="pay-btn"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  
  const handleStripeSelect = async () => {
    setPaymentMethod('stripe');
    setLoading(true);
    try {
      const response = await axiosInstance.post('/orders/create-payment-intent');
      setClientSecret(response.data.clientSecret);
      setPaymentIntentId(response.data.paymentIntentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleCodConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/orders/confirm-cod');
      await fetchCart();
      navigate('/orders', { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Processing...</div>;
  if (error) return <div className="error-container">{error}</div>;

  if (!paymentMethod) {
    return (
      <div className="checkout-page">
        <h2>Select Payment Method</h2>
        <div className="payment-options" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '2rem auto' }}>
          <button className="btn btn-outline" onClick={() => setPaymentMethod('cod')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '1rem', width: '100%', fontSize: '1.1rem' }}>
            <Truck /> Cash on Delivery
          </button>
          <button className="btn btn-primary" onClick={handleStripeSelect} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '1rem', width: '100%', fontSize: '1.1rem' }}>
            <CreditCard /> Pay with Card (Stripe)
          </button>
        </div>
      </div>
    );
  }

  if (paymentMethod === 'cod') {
    return (
      <div className="checkout-page" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Cash on Delivery</h2>
        <p style={{ margin: '2rem 0' }}>You will pay for your order when it arrives. Click below to confirm your order.</p>
        <button className="btn btn-primary full-width" onClick={handleCodConfirm}>
          Confirm Order
        </button>
        <button className="btn btn-outline full-width mt-2" onClick={() => setPaymentMethod(null)} style={{ marginTop: '1rem' }}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h2>Complete Your Order</h2>
      <button className="btn btn-outline mb-4" onClick={() => setPaymentMethod(null)} style={{ marginBottom: '2rem' }}>Back to Payment Options</button>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <CheckoutForm paymentIntentId={paymentIntentId} />
        </Elements>
      )}
    </div>
  );
};

export default Checkout;
