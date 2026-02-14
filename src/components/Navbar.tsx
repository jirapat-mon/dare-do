"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { t } = useI18n();
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreOpen]);

  const navLinkClass =
    "text-app-secondary hover:text-app transition text-sm whitespace-nowrap";

  const dropdownLinkClass =
    "block px-4 py-2.5 text-sm text-app-secondary hover:text-app hover:bg-[var(--bg-secondary)] transition whitespace-nowrap";

  // Primary nav items (always visible on desktop)
  const primaryLinks = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/create", label: t("nav.create") },
    { href: "/wallet", label: t("nav.wallet") },
    { href: "/leaderboard", label: t("nav.leaderboard") },
  ];

  // Secondary nav items (in "More" dropdown on md, visible on xl)
  const secondaryLinks = [
    { href: "/announcements", label: t({ th: "ประกาศ", en: "Announcements" }) },
    { href: "/profile", label: t("nav.profile") },
    { href: "/friends", label: t("nav.friends") },
    { href: "/province", label: t("nav.province") },
  ];

  // All nav items for mobile menu
  const allLinks = [...primaryLinks, ...secondaryLinks];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-black shrink-0">
          Dare<span className="text-orange-500">Do</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 ml-6">
          {isLoggedIn && (
            <>
              {/* Primary links - always visible */}
              {primaryLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass}>
                  {link.label}
                </Link>
              ))}

              {/* Secondary links - visible on xl+, hidden in dropdown on md-lg */}
              {secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hidden xl:block ${navLinkClass}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* "More" dropdown - visible on md-lg, hidden on xl+ */}
              <div ref={moreRef} className="relative xl:hidden">
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`${navLinkClass} flex items-center gap-1`}
                >
                  {t({ th: "เพิ่มเติม", en: "More" })}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isMoreOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isMoreOpen && (
                  <div className="absolute top-full right-0 mt-2 py-1 bg-[var(--bg-primary)] border border-app rounded-lg shadow-lg min-w-[160px] z-50">
                    {secondaryLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMoreOpen(false)}
                        className={dropdownLinkClass}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin link */}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-red-400 hover:text-red-300 transition text-sm whitespace-nowrap"
                >
                  {t("nav.admin")}
                </Link>
              )}
            </>
          )}

          {/* Divider */}
          {isLoggedIn && (
            <div className="w-px h-5 bg-[var(--border-app)] mx-1" />
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-2 ml-1">
              <span className="text-sm text-app-secondary truncate max-w-[120px]">
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-full border border-app text-app-secondary hover:text-app hover:border-red-500 transition whitespace-nowrap"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm px-4 py-1.5 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition whitespace-nowrap"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-app p-2"
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
        <div className="md:hidden bg-[var(--bg-primary)]/95 border-b border-app px-4 py-3">
          {isLoggedIn ? (
            <>
              {/* User info */}
              <p className="text-sm text-app-muted py-2 px-1 border-b border-app mb-2">
                {user?.name || user?.email}
              </p>

              {/* Nav links */}
              <div className="space-y-0.5">
                {allLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-app-secondary hover:text-app hover:bg-[var(--bg-secondary)] transition py-2.5 px-2 rounded-md text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-red-400 hover:text-red-300 hover:bg-[var(--bg-secondary)] transition py-2.5 px-2 rounded-md text-sm"
                  >
                    {t("nav.admin")}
                  </Link>
                )}
              </div>

              {/* Logout */}
              <div className="border-t border-app mt-2 pt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block text-red-400 hover:text-red-300 hover:bg-[var(--bg-secondary)] transition py-2.5 px-2 rounded-md text-sm w-full text-left"
                >
                  {t("nav.logout")}
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-orange-500 hover:text-orange-400 transition py-2.5 px-2 text-sm"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
