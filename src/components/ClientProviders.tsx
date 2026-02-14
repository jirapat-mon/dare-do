"use client";

import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import Navbar from "./Navbar";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <I18nProvider>
          <Navbar />
          <div className="pt-16">{children}</div>
        </I18nProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
