"use client";

import { useState } from "react";
import { FaXmark, FaUser, FaEnvelope, FaLock, FaShieldHalved, FaCheck, FaCamera } from "react-icons/fa6";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login, register } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isValidEmail) {
        setError(t("auth.invalidEmail"));
        setLoading(false);
        return;
      }

      if (authModalMode === "login") {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || "Login failed");
        }
      } else {
        if (!name.trim()) {
          setError("Wprowadź swój Nick / Enter your Nick");
          setLoading(false);
          return;
        }
        if (!hasMinLength || !hasUppercase) {
          setError(t("auth.invalidPassword"));
          setLoading(false);
          return;
        }
        const res = await register(name, email, password, avatarUrl);
        if (!res.success) {
          setError(res.error || "Registration failed");
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={closeAuthModal}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-brand-amethyst/30 bg-brand-black bg-texture shadow-2xl shadow-brand-amethyst/20">
        
        {/* Glowing header strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-amethyst via-purple-500 to-brand-pale" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors p-2 cursor-pointer"
          aria-label="Close modal"
        >
          <FaXmark size={20} />
        </button>

        <div className="p-6 md:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-amethyst/15 text-brand-amethyst mb-3 border border-brand-amethyst/30 shadow-[0_0_15px_rgba(123,114,181,0.25)]">
              <FaShieldHalved size={22} />
            </div>
            <h2 className="font-sans text-2xl font-bold uppercase tracking-wider text-white">
              SKET-OK Account
            </h2>
            <p className="font-mono text-xs text-white/50 mt-1">
              {authModalMode === "login"
                ? t("auth.login")
                : t("auth.register")}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setError(null);
                openAuthModal("login");
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                authModalMode === "login"
                  ? "bg-brand-amethyst text-white shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t("auth.login")}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                openAuthModal("register");
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                authModalMode === "register"
                  ? "bg-brand-amethyst text-white shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t("auth.register")}
            </button>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 font-sans text-xs flex items-center gap-2">
              <span className="font-bold">!</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === "register" && (
              <div className="flex items-center gap-3">
                <label
                  title="Wgraj swój Avatar / Upload Avatar"
                  className="relative size-11 rounded-full bg-white/10 border border-white/20 hover:border-brand-amethyst flex items-center justify-center cursor-pointer shrink-0 overflow-hidden group shadow-md mt-4"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAvatarUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
                  ) : (
                    <FaCamera className="size-4 text-white/60 group-hover:text-brand-amethyst group-hover:scale-110 transition-all" />
                  )}
                </label>
                <div className="grow">
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    {t("auth.name")}
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 size-4" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="skater99"
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst focus:ring-1 focus:ring-brand-amethyst transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1.5">
                {t("auth.email")}
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 size-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rider@sket-ok.com"
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst focus:ring-1 focus:ring-brand-amethyst transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1.5">
                {t("auth.password")}
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 size-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst focus:ring-1 focus:ring-brand-amethyst transition-all font-mono"
                />
              </div>

              {/* Password Requirement Indicators (Registration Mode) */}
              {authModalMode === "register" && (
                <div className="mt-2.5 space-y-1 text-[11px] font-sans">
                  <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? "text-emerald-400 font-bold" : "text-white/40"}`}>
                    {hasMinLength ? <FaCheck className="size-3 text-emerald-400 shrink-0" /> : <span className="font-mono text-xs text-white/30">○</span>}
                    <span>{t("auth.passMinChars")}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors ${hasUppercase ? "text-emerald-400 font-bold" : "text-white/40"}`}>
                    {hasUppercase ? <FaCheck className="size-3 text-emerald-400 shrink-0" /> : <span className="font-mono text-xs text-white/30">○</span>}
                    <span>{t("auth.passUppercase")}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 button-cutout bg-gradient-to-b from-brand-amethyst to-brand-pale from-25% to-75% bg-[length:100%_400%] py-3 font-sans text-sm font-bold uppercase tracking-widest text-white transition-[background-position] duration-300 hover:bg-bottom hover:text-black cursor-pointer shadow-lg"
            >
              {loading
                ? "..."
                : authModalMode === "login"
                ? t("auth.submitLogin")
                : t("auth.submitRegister")}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
