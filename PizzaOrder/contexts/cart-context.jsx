import { createContext, useContext, useMemo, useState } from 'react';

import { buildCartItemKey, calculateUnitPrice } from '@/utils/pricing';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = ({ product, selectedOptions, selectedAddOnIds, quantity }) => {
    const unitPrice = calculateUnitPrice(product, selectedOptions, selectedAddOnIds);
    const key = buildCartItemKey(product.id, selectedOptions, selectedAddOnIds);

    setItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.key === key);

      if (index >= 0) {
        const nextItems = [...prevItems];
        const nextQuantity = nextItems[index].quantity + quantity;
        nextItems[index] = {
          ...nextItems[index],
          quantity: nextQuantity,
          lineTotal: unitPrice * nextQuantity,
          unitPrice,
        };
        return nextItems;
      }

      return [
        ...prevItems,
        {
          key,
          productId: product.id,
          name: product.name,
          basePrice: product.basePrice,
          selectedOptions,
          selectedAddOnIds,
          quantity,
          unitPrice,
          lineTotal: unitPrice * quantity,
        },
      ];
    });
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      setItems((prevItems) => prevItems.filter((item) => item.key !== key));
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity,
              lineTotal: item.unitPrice * quantity,
            }
          : item
      )
    );
  };

  const removeItem = (key) => {
    setItems((prevItems) => prevItems.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo(
    () => ({
      items,
      totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
