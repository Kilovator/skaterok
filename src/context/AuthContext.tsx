"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  User,
  SavedBuild,
  Order,
  ShippingMethod,
  PaymentMethod,
  ShippingDetails,
} from "@/lib/db";
import { DeckItem, WheelItem, MetalItem } from "@/data/boardCustomizer";
import { CartItem } from "@/context/CartContext";

type AuthModalMode = "login" | "register" | "forgot_password";

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  savedBuilds: SavedBuild[];
  orders: Order[];
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateNickname: (newNickname: string) => Promise<{ success: boolean; error?: string; daysRemaining?: number }>;
  saveBuild: (build: {
    name?: string;
    deck: DeckItem;
    wheels: WheelItem;
    truck: MetalItem;
    bolt: MetalItem;
    price?: number;
  }) => Promise<SavedBuild | null>;
  deleteBuild: (id: string) => Promise<void>;
  placeOrder: (orderData: {
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    shippingMethod: ShippingMethod;
    shippingDetails: ShippingDetails;
    paymentMethod: PaymentMethod;
    paymentInfo?: string;
  }) => Promise<Order | null>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const CURRENT_USER_SESSION_KEY = "sket_ok_current_user_email";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch session & user data from Neon DB PostgreSQL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem(CURRENT_USER_SESSION_KEY);
      if (storedEmail) {
        fetch(`/api/auth/user?email=${encodeURIComponent(storedEmail)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.user) {
              setUser(data.user);
              setSavedBuilds(data.savedBuilds || []);
              setOrders(data.orders || []);
            }
          })
          .catch((e) => console.error("Neon DB user restore error:", e));
      }
    }
  }, []);

  const refreshUserData = async () => {
    if (user?.email) {
      try {
        const res = await fetch(`/api/auth/user?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setSavedBuilds(data.savedBuilds || []);
          setOrders(data.orders || []);
        }
      } catch (e) {
        console.error("Neon DB refresh error:", e);
      }
    }
  };

  const openAuthModal = (mode: AuthModalMode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!data.success || !data.user) {
        return { success: false, error: data.error || "Nieprawidłowy e-mail lub hasło." };
      }

      setUser(data.user);
      localStorage.setItem(CURRENT_USER_SESSION_KEY, data.user.email);
      setIsAuthModalOpen(false);

      // Fetch user builds and orders from Neon DB
      refreshUserData();

      return { success: true };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, error: err.message || "Błąd połączenia z bazą Neon DB." };
    }
  };

  const register = async (name: string, email: string, pass: string, avatar?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass, avatar }),
      });
      const data = await res.json();

      if (!data.success || !data.user) {
        return { success: false, error: data.error || "Nie udało się utworzyć konta w Neon DB." };
      }

      setUser(data.user);
      localStorage.setItem(CURRENT_USER_SESSION_KEY, data.user.email);
      setSavedBuilds([]);
      setOrders([]);
      setIsAuthModalOpen(false);

      return { success: true };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, error: err.message || "Błąd rejestracji w bazie Neon DB." };
    }
  };

  const resetPassword = async (email: string, newPass: string) => {
    try {
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: [{ email, passwordHash: newPass }],
        }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: "Nie znaleziono konta w bazie Neon DB." };
      }
      return { success: true };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, error: err.message };
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/update-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, avatarUrl }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (e) {
      console.error("Neon DB avatar update error:", e);
    }
  };

  const updateNickname = async (newNickname: string) => {
    if (!user) return { success: false, error: "Nie jesteś zalogowany." };

    try {
      const res = await fetch("/api/auth/update-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newNickname }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error, daysRemaining: data.daysRemaining };
      }

      if (data.user) {
        setUser(data.user);
      }
      return { success: true };
    } catch (e: unknown) {
      const err = e as Error;
      return { success: false, error: err.message || "Błąd aktualizacji nicku w Neon DB." };
    }
  };

  const logout = () => {
    setUser(null);
    setSavedBuilds([]);
    setOrders([]);
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
  };

  const saveBuild = async (build: {
    name?: string;
    deck: DeckItem;
    wheels: WheelItem;
    truck: MetalItem;
    bolt: MetalItem;
    price?: number;
  }) => {
    if (!user) {
      openAuthModal("login");
      return null;
    }

    try {
      const res = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", userId: user.id, build }),
      });
      const data = await res.json();
      if (data.success && data.build) {
        setSavedBuilds((prev) => [data.build, ...prev]);
        return data.build;
      }
    } catch (e) {
      console.error("Neon DB save build error:", e);
    }
    return null;
  };

  const deleteBuild = async (buildId: string) => {
    if (!user) return;
    setSavedBuilds((prev) => prev.filter((b) => b.id !== buildId));
    try {
      await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", userId: user.id, buildId }),
      });
    } catch (e) {
      console.error("Neon DB delete build error:", e);
    }
  };

  const placeOrder = async (orderData: {
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    shippingMethod: ShippingMethod;
    shippingDetails: ShippingDetails;
    paymentMethod: PaymentMethod;
    paymentInfo?: string;
  }) => {
    const userId = user ? user.id : "guest_order";
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, orderData }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        if (user) {
          setOrders((prev) => [data.order, ...prev]);
        }
        return data.order;
      }
    } catch (e) {
      console.error("Neon DB place order error:", e);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthModalOpen,
        authModalMode,
        savedBuilds,
        orders,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        resetPassword,
        logout,
        updateAvatar,
        updateNickname,
        saveBuild,
        deleteBuild,
        placeOrder,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
