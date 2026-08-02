"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  db,
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
  updateAvatar: (avatarUrl: string) => void;
  updateNickname: (newNickname: string) => Promise<{ success: boolean; error?: string; daysRemaining?: number }>;
  saveBuild: (build: {
    name?: string;
    deck: DeckItem;
    wheels: WheelItem;
    truck: MetalItem;
    bolt: MetalItem;
    price?: number;
  }) => SavedBuild | null;
  deleteBuild: (id: string) => void;
  placeOrder: (orderData: {
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    shippingMethod: ShippingMethod;
    shippingDetails: ShippingDetails;
    paymentMethod: PaymentMethod;
    paymentInfo?: string;
  }) => Order;
  refreshUserData: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const CURRENT_USER_SESSION_KEY = "sket_ok_current_user_email";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Restore session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem(CURRENT_USER_SESSION_KEY);
      if (storedEmail) {
        const found = db.getUserByEmail(storedEmail);
        if (found) {
          setUser(found);
          setSavedBuilds(db.getSavedBuilds(found.id));
          setOrders(db.getUserOrders(found.id));
        }
      }
    }
  }, []);

  const refreshUserData = () => {
    if (user) {
      const updated = db.getUserByEmail(user.email);
      if (updated) {
        setUser({ ...updated });
      }
      setSavedBuilds(db.getSavedBuilds(user.id));
      setOrders(db.getUserOrders(user.id));
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
    const verified = db.verifyUser(email, pass);
    if (!verified) {
      return { success: false, error: "Incorrect email or password" };
    }
    setUser(verified);
    localStorage.setItem(CURRENT_USER_SESSION_KEY, verified.email);
    setSavedBuilds(db.getSavedBuilds(verified.id));
    setOrders(db.getUserOrders(verified.id));
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const register = async (name: string, email: string, pass: string, avatar?: string) => {
    const existing = db.getUserByEmail(email);
    if (existing) {
      return { success: false, error: "User with this email already exists" };
    }
    const newUser = db.createUser(name, email, pass, avatar);
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_SESSION_KEY, newUser.email);
    setSavedBuilds(db.getSavedBuilds(newUser.id));
    setOrders(db.getUserOrders(newUser.id));
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const resetPassword = async (email: string, newPass: string) => {
    const updated = db.updateUserPassword(email, newPass);
    if (!updated) {
      return { success: false, error: "Nie znaleziono konta z tym adresem e-mail." };
    }
    return { success: true };
  };

  const updateAvatar = (avatarUrl: string) => {
    if (!user) return;
    const updated = db.updateUserAvatar(user.id, avatarUrl);
    if (updated) {
      setUser({ ...updated });
    }
  };

  const updateNickname = async (newNickname: string) => {
    if (!user) return { success: false, error: "Nie jesteś zalogowany." };
    const res = db.updateUserNickname(user.id, newNickname);
    if (res.success && res.user) {
      setUser({ ...res.user });
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setSavedBuilds([]);
    setOrders([]);
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
  };

  const saveBuild = (build: {
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
    const saved = db.addSavedBuild(user.id, build);
    setSavedBuilds(db.getSavedBuilds(user.id));
    return saved;
  };

  const deleteBuild = (buildId: string) => {
    if (!user) return;
    db.deleteSavedBuild(user.id, buildId);
    setSavedBuilds(db.getSavedBuilds(user.id));
  };

  const placeOrder = (orderData: {
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
    const newOrder = db.createOrder(userId, orderData);
    if (user) {
      setOrders(db.getUserOrders(user.id));
    }
    return newOrder;
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
