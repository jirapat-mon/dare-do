"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function RegisterPage() {
  const { t } = useI18n();
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const result = await register(email, password, name);

    setLoading(false);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === "google") {
      window.location.href = "/api/auth/google";
      return;
    }
    alert(`Social login with ${provider} is not yet implemented`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">
            Dare<span className="text-orange-500">Do</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">{t("auth.register")}</p>
        </div>

        {/* Social Login */}
        <SocialLoginButtons onProviderClick={handleSocialLogin} />

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#333]"></div>
          <span className="text-sm text-gray-500">
            {t("auth.orSignUpWith")}
          </span>
          <div className="flex-1 h-px bg-[#333]"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t("auth.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t("auth.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t("auth.confirmPassword")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-full transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : t("auth.registerButton")}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          {t("auth.hasAccount")}{" "}
          <Link
            href="/login"
            className="text-orange-500 hover:text-orange-400 font-semibold transition"
          >
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
