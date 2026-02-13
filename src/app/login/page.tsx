"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function LoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email);
      router.push("/dashboard");
    }
  };

  const handleSocialLogin = (provider: string) => {
    login(`user@${provider}.com`);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">
            Dare<span className="text-orange-500">Do</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">{t("auth.login")}</p>
        </div>

        {/* Social Login */}
        <SocialLoginButtons onProviderClick={handleSocialLogin} />

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#333]"></div>
          <span className="text-sm text-gray-500">
            {t("auth.orContinueWith")}
          </span>
          <div className="flex-1 h-px bg-[#333]"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t("auth.password")}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="text-right">
            <Link
              href="#"
              className="text-sm text-orange-500 hover:text-orange-400 transition"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-full transition-all"
          >
            {t("auth.loginButton")}
          </button>
        </form>

        {/* Magic Link */}
        <div className="mt-4">
          <button className="w-full border border-orange-500 text-orange-500 hover:bg-orange-500/10 font-semibold py-3 rounded-full transition">
            {t("auth.magicLink")}
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          {t("auth.noAccount")}{" "}
          <Link
            href="/register"
            className="text-orange-500 hover:text-orange-400 font-semibold transition"
          >
            {t("auth.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
