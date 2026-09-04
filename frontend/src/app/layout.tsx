import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Spark Technologies — Reliability",
  description: "Textile asset reliability platform",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark" as const,
};

const themeScript = `
  try {
    const stored = localStorage.getItem("spark-theme");
    const theme = stored === "dark" || stored === "light"
      ? stored
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (_) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${hanken.variable} ${inter.variable} ${jetbrains.variable} font-[family-name:var(--font-inter)] antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
