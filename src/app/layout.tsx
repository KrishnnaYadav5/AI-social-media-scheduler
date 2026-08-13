import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme.provider";
import { AuthProvider } from "@/components/providers/auth.provider";

export const metadata: Metadata = {
  title: "AI Social Media Scheduler SaaS",
  description: "Production-ready AI Social Media Scheduler SaaS built with Neon, Drizzle, Upstash QStash, Cloudflare R2, and Google Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}