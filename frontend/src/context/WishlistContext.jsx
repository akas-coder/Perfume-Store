import { createContext, useContext, useState, useCallback } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const addToWishlistSet = (productId) => {
    setWishlistIds(prev => new Set([...prev, productId]));
  };

  const removeFromWishlistSet = (productId) => {
    setWishlistIds(prev => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const isInWishlist = useCallback((productId) => wishlistIds.has(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, addToWishlistSet, removeFromWishlistSet, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
