import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { setCart(null); setCartCount(0); return; }
    try {
      setLoading(true);
      const res = await cartAPI.get();
      if (res.data.success) {
        setCart(res.data.data);
        setCartCount(res.data.data?.items?.length || 0);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [isLoggedIn]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, giftPackaging = 'NORMAL') => {
    const res = await cartAPI.addItem({ productId, quantity, giftPackaging });
    if (res.data.success) {
      setCart(res.data.data);
      setCartCount(res.data.data?.items?.length || 0);
    }
    return res.data;
  };

  const updateItem = async (itemId, quantity) => {
    const res = await cartAPI.updateItem(itemId, quantity);
    if (res.data.success) {
      setCart(res.data.data);
      setCartCount(res.data.data?.items?.length || 0);
    }
  };

  const removeItem = async (itemId) => {
    const res = await cartAPI.removeItem(itemId);
    if (res.data.success) {
      setCart(res.data.data);
      setCartCount(res.data.data?.items?.length || 0);
    }
  };

  const applyCoupon = async (couponCode) => {
    const res = await cartAPI.applyCoupon(couponCode);
    if (res.data.success) setCart(res.data.data);
    return res.data;
  };

  const removeCoupon = async () => {
    const res = await cartAPI.removeCoupon();
    if (res.data.success) setCart(res.data.data);
  };

  // Compute totals from cart
  const getSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.originalPrice;
      const giftCharge = item.giftPackaging === 'PREMIUM' ? 99 : 0;
      return sum + (price * item.quantity) + giftCharge;
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      cart, cartCount, loading, fetchCart,
      addToCart, updateItem, removeItem,
      applyCoupon, removeCoupon, getSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
