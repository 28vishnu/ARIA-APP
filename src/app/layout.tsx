import "./globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  title: "ARIA — Personal AI Workspace",
  description: "A liquid-glass personal AI workspace powered by your ARIA backend.",
  applicationName: "ARIA",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ARIA" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover", themeColor: "#f4f4fa" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
