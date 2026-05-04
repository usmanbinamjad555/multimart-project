import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mm_cart')) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('mm_cart', JSON.stringify(cartItems)); }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.productId === item.productId && i.tenantSlug === item.tenantSlug);
      if (exists) return prev.map(i => i.productId === item.productId && i.tenantSlug === item.tenantSlug ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i);
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (productId, tenantSlug) => setCartItems(prev => prev.filter(i => !(i.productId === productId && i.tenantSlug === tenantSlug)));
  const updateQuantity = (productId, tenantSlug, qty) => {
    if (qty <= 0) { removeFromCart(productId, tenantSlug); return; }
    setCartItems(prev => prev.map(i => i.productId === productId && i.tenantSlug === tenantSlug ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
