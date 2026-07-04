import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  // Track items currently being removed to prevent double-click
  const [removingItems, setRemovingItems] = useState(new Set());
  // Track items currently being updated
  const [updatingItems, setUpdatingItems] = useState(new Set());

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
    if (updatingItems.has(itemId)) return;

    // Optimistic update
    setUpdatingItems(prev => new Set(prev).add(itemId));
    const prevCart = cart;

    if (quantity <= 0) {
      // If quantity goes to 0, use removeItem flow
      setUpdatingItems(prev => { const s = new Set(prev); s.delete(itemId); return s; });
      await removeItem(itemId);
      return;
    }

    setCart(prev => {
      if (!prev?.items) return prev;
      return {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      };
    });

    try {
      const res = await cartAPI.updateItem(itemId, quantity);
      if (res.data.success) {
        setCart(res.data.data);
        setCartCount(res.data.data?.items?.length || 0);
      }
    } catch (err) {
      // Revert on error
      setCart(prevCart);
      throw err;
    } finally {
      setUpdatingItems(prev => { const s = new Set(prev); s.delete(itemId); return s; });
    }
  };

  const removeItem = async (itemId) => {
    if (removingItems.has(itemId)) return;

    // Optimistic removal
    setRemovingItems(prev => new Set(prev).add(itemId));
    const prevCart = cart;

    setCart(prev => {
      if (!prev?.items) return prev;
      const newItems = prev.items.filter(item => item.id !== itemId);
      return { ...prev, items: newItems };
    });
    setCartCount(prev => Math.max(0, prev - 1));

    try {
      const res = await cartAPI.removeItem(itemId);
      if (res.data.success) {
        setCart(res.data.data);
        setCartCount(res.data.data?.items?.length || 0);
      }
    } catch (err) {
      // Revert on error
      setCart(prevCart);
      setCartCount(prevCart?.items?.length || 0);
      throw err;
    } finally {
      setRemovingItems(prev => { const s = new Set(prev); s.delete(itemId); return s; });
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
      applyCoupon, removeCoupon, getSubtotal,
      removingItems, updatingItems
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
