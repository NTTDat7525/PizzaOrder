import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import type { CartItem, Product, SelectedOptions } from '@/types/menu';
import { buildCartItemKey, calculateUnitPrice } from '@/utils/pricing';

type AddCartPayload = {
  product: Product;
  selectedOptions: SelectedOptions;
  selectedAddOnIds: string[];
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  addItem: (payload: AddCartPayload) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = ({ product, selectedOptions, selectedAddOnIds, quantity }: AddCartPayload) => {
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

  const updateQuantity = (key: string, quantity: number) => {
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

  const removeItem = (key: string) => {
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