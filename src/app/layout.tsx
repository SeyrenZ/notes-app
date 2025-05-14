import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
                  
                  // Apply font preference
                  const savedFont = localStorage.getItem('font');
                  const body = document.body;
                  
                  if (savedFont === 'serif') {
                    body.classList.add('font-serif');
                  } else if (savedFont === 'monospace') {
                    body.classList.add('font-mono');
                  } else {
                    // Default to sans-serif
                    body.classList.add('font-sans');
                  }
                } catch (e) {
                  // Fallback if localStorage is not available
                  console.error('Failed to set initial preferences', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
