"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const { t } = useI18n();
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#1A1A1A]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-black">
          Dare<span className="text-orange-500">Do</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {isLoggedIn && (
            <>
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white transition text-sm"
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                href="/create"
                className="text-gray-400 hover:text-white transition text-sm"
              >
                {t("nav.create")}
              </Link>
              <Link
                href="/wallet"
                className="text-gray-400 hover:text-white transition text-sm"
              >
                {t("nav.wallet")}
              </Link>
            </>
          )}
          <LanguageToggle />
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-full border border-[#333] text-gray-400 hover:text-white hover:border-red-500 transition"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm px-5 py-2 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <LanguageToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-[#1A1A1A] px-4 py-4 space-y-3">
          {isLoggedIn ? (
            <>
              <p className="text-sm text-gray-500 py-1">{user?.email}</p>
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-400 hover:text-white transition py-2"
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                href="/create"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-400 hover:text-white transition py-2"
              >
                {t("nav.create")}
              </Link>
              <Link
                href="/wallet"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-400 hover:text-white transition py-2"
              >
                {t("nav.wallet")}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block text-red-400 hover:text-red-300 transition py-2 w-full text-left"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-orange-500 hover:text-orange-400 transition py-2"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
