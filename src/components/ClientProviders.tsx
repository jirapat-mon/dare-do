"use client";

import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import Navbar from "./Navbar";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <Navbar />
        <div className="pt-16">{children}</div>
      </I18nProvider>
    </AuthProvider>
  );
}
