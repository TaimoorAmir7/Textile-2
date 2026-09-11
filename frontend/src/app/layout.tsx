import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spark Technologies — Production Reliability",
  description: "Textile production-quality reliability platform",
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
        className="font-body antialiased"
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
