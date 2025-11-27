import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import ClientToaster from "@/components/ui/client-toaster";
import { GoogleAnalytics } from "@/components/layout/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chainfundit",
  description: "Raise funds - support dreams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7VNFF33E8Z"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7VNFF33E8Z', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="app-root">
          {children}
          <GoogleAnalytics />
          <PerformanceMonitor />
          <ClientToaster />
        </div>
      </body>
    </html>
  );
}
