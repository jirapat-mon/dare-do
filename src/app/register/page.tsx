"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function RegisterPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const router = useRouter();

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
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t("auth.email")}
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
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

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t("auth.confirmPassword")}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-full transition-all mt-2">
            {t("auth.registerButton")}
          </button>
        </div>

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
