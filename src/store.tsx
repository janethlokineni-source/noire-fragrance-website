import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, Product, ProductSize } from './types';

// ---- Cart State ----
interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  toastMessage: string | null;
}

type StoreAction =
  | { type: 'ADD_TO_CART'; product: Product; size: ProductSize }
  | { type: 'REMOVE_FROM_CART'; productId: string; sizeML: number }
  | { type: 'UPDATE_QUANTITY'; productId: string; sizeML: number; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART'; open?: boolean }
  | { type: 'TOGGLE_WISHLIST'; productId: string }
  | { type: 'SET_TOAST'; message: string | null };

const initialState: StoreState = {
  cart: [],
  wishlist: [],
  isCartOpen: false,
  toastMessage: null,
};

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.cart.find(
        (item) => item.product.id === action.product.id && item.size.ml === action.size.ml
      );
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.product.id === action.product.id && item.size.ml === action.size.ml
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.product, quantity: 1, size: action.size }],
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(
          (item) => !(item.product.id === action.productId && item.size.ml === action.sizeML)
        ),
      };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(
            (item) => !(item.product.id === action.productId && item.size.ml === action.sizeML)
          ),
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.product.id === action.productId && item.size.ml === action.sizeML
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: action.open !== undefined ? action.open : !state.isCartOpen };
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.productId)
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
      };
    case 'SET_TOAST':
      return { ...state, toastMessage: action.message };
    default:
      return state;
  }
}

// ---- Context ----
interface StoreContextValue {
  state: StoreState;
  addToCart: (product: Product, size: ProductSize) => void;
  removeFromCart: (productId: string, sizeML: number) => void;
  updateQuantity: (productId: string, sizeML: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('noire-cart');
      const savedWishlist = localStorage.getItem('noire-wishlist');
      return {
        ...init,
        cart: saved ? JSON.parse(saved) : [],
        wishlist: savedWishlist ? JSON.parse(savedWishlist) : [],
      };
    } catch {
      return init;
    }
  });

  // Persist cart
  useEffect(() => {
    localStorage.setItem('noire-cart', JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    localStorage.setItem('noire-wishlist', JSON.stringify(state.wishlist));
  }, [state.wishlist]);

  // Toast auto-dismiss
  useEffect(() => {
    if (state.toastMessage) {
      const t = setTimeout(() => dispatch({ type: 'SET_TOAST', message: null }), 3000);
      return () => clearTimeout(t);
    }
  }, [state.toastMessage]);

  const addToCart = useCallback((product: Product, size: ProductSize) => {
    dispatch({ type: 'ADD_TO_CART', product, size });
    dispatch({ type: 'SET_TOAST', message: `${product.name} added to bag` });
  }, []);

  const removeFromCart = useCallback((productId: string, sizeML: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', productId, sizeML });
  }, []);

  const updateQuantity = useCallback((productId: string, sizeML: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, sizeML, quantity });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const toggleCart = useCallback((open?: boolean) => dispatch({ type: 'TOGGLE_CART', open }), []);
  const toggleWishlist = useCallback((productId: string) => {
    dispatch({ type: 'TOGGLE_WISHLIST', productId });
  }, []);

  const isInWishlist = useCallback((productId: string) => state.wishlist.includes(productId), [state.wishlist]);

  const cartTotal = state.cart.reduce((sum: number, item: CartItem) => sum + item.size.price * item.quantity, 0);
  const cartCount = state.cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider value={{
      state, addToCart, removeFromCart, updateQuantity,
      clearCart, toggleCart, toggleWishlist, isInWishlist,
      cartTotal, cartCount,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
