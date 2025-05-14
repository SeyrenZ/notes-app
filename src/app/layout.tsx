import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notes App",
  description: "A modern notes web application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* This script runs before page renders to avoid theme flashing */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Try to get theme from localStorage
                  const savedTheme = localStorage.getItem('theme');
                  const root = document.documentElement;
                  
                  if (savedTheme === 'dark') {
                    root.classList.add('dark');
                  } else if (savedTheme === 'light') {
                    root.classList.add('light');
                  } else {
                    // Handle system preference for 'system' setting
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  }
                } catch (e) {
                  // Fallback if localStorage is not available
                  console.error('Failed to set initial theme', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
