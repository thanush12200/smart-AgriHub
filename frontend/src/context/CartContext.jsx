import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'smart_agri_cart_v1';

const CartContext = createContext(null);

const readStoredCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product) => {
    let status = { ok: true, message: `${product.name} added to cart.` };

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (!existing) {
        return [
          ...current,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            unit: product.unit,
            brand: product.brand,
            stock: product.stock,
            quantity: 1
          }
        ];
      }

      if (existing.quantity >= existing.stock) {
        status = { ok: false, message: `Only ${existing.stock} units available for ${existing.name}.` };
        return current;
      }

      return current.map((item) =>
        item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) } : item
      );
    });

    return status;
  };

  const updateQuantity = (productId, nextQuantity) => {
    setItems((current) => {
      if (nextQuantity <= 0) {
        return current.filter((item) => item.id !== productId);
      }

      return current.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(Math.max(1, nextQuantity), item.stock) }
          : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    return {
      items,
      itemCount,
      totalAmount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
