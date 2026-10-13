import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalWeight: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (book: Book, quantity: number = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.book.id === book.id);

        if (existingIndex > -1) {
          const newItems = [...currentItems];
          const newQty = newItems[existingIndex].quantity + quantity;
          // Protect real stock constraint if available
          newItems[existingIndex].quantity = book.stock > 0 ? Math.min(newQty, book.stock) : newQty;
          set({ items: newItems });
        } else {
          set({
            items: [
              ...currentItems,
              {
                book,
                quantity: book.stock > 0 ? Math.min(quantity, book.stock) : quantity,
              },
            ],
          });
        }
      },

      removeItem: (bookId: number) => {
        set({
          items: get().items.filter((item) => item.book.id !== bookId),
        });
      },

      updateQuantity: (bookId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(bookId);
          return;
        }

        const currentItems = get().items;
        const updated = currentItems.map((item) => {
          if (item.book.id === bookId) {
            const finalQty = item.book.stock > 0 ? Math.min(quantity, item.book.stock) : quantity;
            return { ...item, quantity: finalQty };
          }
          return item;
        });

        set({ items: updated });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.book.final_price * item.quantity,
          0
        );
      },

      getTotalWeight: () => {
        return get().items.reduce(
          (total, item) => total + item.book.weight_grams * item.quantity,
          0
        );
      },
    }),
    {
      name: 'jendela_buku_cart',
    }
  )
);
