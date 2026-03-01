import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface AuthState {
  token: string | null;
  user: any;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' && localStorage.getItem('user') ? (() => {
    try {
      return JSON.parse(localStorage.getItem('user')!);
    } catch (e) {
      return null;
    }
  })() : null,
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  checkAuth: async () => {
    try {
      const response = await authAPI.getMe();
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      // If checkAuth fails (e.g. 401), clear local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null });
    }
  },
}));

interface ThemeState {
  isDark: boolean;
  toggleDark: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false,
  toggleDark: () =>
    set((state) => {
      const newDark = !state.isDark;
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newDark);
      return { isDark: newDark };
    }),
}));

interface LanguageState {
  language: 'en' | 'ne';
  setLanguage: (lang: 'en' | 'ne') => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: (typeof window !== 'undefined' ? localStorage.getItem('language') as 'en' | 'ne' : 'en') || 'en',
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },
}));

interface CartItem {
  productId: string;
  productCode?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  panelType?: string;
  thickness?: number;
  length?: number;
  finishing?: string;
  itemNotes?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: typeof window !== 'undefined' && localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')!) : [],
  addItem: (item) => {
    const currentItems = get().items;
    const existingItem = currentItems.find(i => i.productId === item.productId);
    
    let newItems;
    if (existingItem) {
      newItems = currentItems.map(i => 
        i.productId === item.productId 
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      newItems = [...currentItems, item];
    }
    
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },
  removeItem: (productId) => {
    const newItems = get().items.filter(i => i.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },
  updateQuantity: (productId, quantity) => {
    const newItems = get().items.map(i => 
      i.productId === productId ? { ...i, quantity } : i
    );
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },
  updateItemNotes: (productId, notes) => {
    const newItems = get().items.map(i => 
      i.productId === productId ? { ...i, itemNotes: notes } : i
    );
    localStorage.setItem('cart', JSON.stringify(newItems));
    set({ items: newItems });
  },
  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },
  totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  totalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
}));

interface AdminState {
  activeVertical: 'ECOPANELS' | 'MODULARHOMES';
  setActiveVertical: (vertical: 'ECOPANELS' | 'MODULARHOMES') => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeVertical: 'ECOPANELS',
  setActiveVertical: (vertical) => set({ activeVertical: vertical }),
}));
