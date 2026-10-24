import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sbi_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Narsapur Town / Market Area');
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState(2);
  const deliveryRatePerKm = 4; // ₹4 per km rule

  useEffect(() => {
    localStorage.setItem('sbi_cart_items', JSON.stringify(items));
  }, [items]);

  const addItem = (product, selectedWeight = '1 kg', cakeMessage = '', selectedVariant = null) => {
    setItems(prevItems => {
      // Create a unique key for cart item based on product ID, weight, and variant
      const itemKey = `${product._id || product.id}-${selectedWeight}-${selectedVariant || ''}`;
      const existingIndex = prevItems.findIndex(i => i.itemKey === itemKey);

      let unitPrice = product.basePrice;
      if (product.category === 'cake') {
        if (selectedWeight === '2 kg') unitPrice = product.basePrice * 2;
        else if (selectedWeight === '3 kg') unitPrice = product.basePrice * 3;
        else unitPrice = product.basePrice;
      } else if (selectedVariant && product.variants?.length) {
        const found = product.variants.find(v => v.name === selectedVariant);
        if (found) unitPrice = found.price;
      }

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        updated[existingIndex].total = updated[existingIndex].quantity * unitPrice;
        if (cakeMessage) updated[existingIndex].cakeMessage = cakeMessage;
        return updated;
      } else {
        const newItem = {
          itemKey,
          productId: product._id || product.id,
          name: product.name,
          category: product.category,
          flavour: product.flavour || null,
          weight: product.category === 'cake' ? selectedWeight : null,
          selectedVariant: selectedVariant || null,
          cakeMessage: cakeMessage.trim(),
          unitPrice,
          quantity: 1,
          total: unitPrice,
          image: product.image
        };
        return [...prevItems, newItem];
      }
    });

    setIsDrawerOpen(true);
  };

  const updateQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      removeItem(itemKey);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.itemKey === itemKey) {
          return {
            ...item,
            quantity,
            total: quantity * item.unitPrice
          };
        }
        return item;
      })
    );
  };

  const removeItem = (itemKey) => {
    setItems(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const cakeSubtotal = items
    .filter(i => i.category === 'cake')
    .reduce((sum, i) => sum + i.total, 0);

  const celebrationSubtotal = items
    .filter(i => i.category === 'celebration')
    .reduce((sum, i) => sum + i.total, 0);

  const subtotal = cakeSubtotal + celebrationSubtotal;
  const deliveryFee = Math.max(1, Number(deliveryDistanceKm) || 5) * deliveryRatePerKm;
  const finalTotal = subtotal + deliveryFee;
  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemCount,
        cakeSubtotal,
        celebrationSubtotal,
        subtotal,
        selectedLocation,
        setSelectedLocation,
        deliveryDistanceKm,
        setDeliveryDistanceKm,
        deliveryFee,
        finalTotal,
        isDrawerOpen,
        setIsDrawerOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
