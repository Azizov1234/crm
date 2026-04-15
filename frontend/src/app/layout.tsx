import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const headingFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Academy Superadmin",
    template: "%s | Academy Superadmin",
  },
  description:
    "Academy superadmin panel: users, students, teachers, groups, attendance, payments va sozlamalar.",
  keywords: ["academy", "superadmin", "learning center", "nextjs", "nestjs"],
  authors: [{ name: "Academy Panel Team" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1416" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
