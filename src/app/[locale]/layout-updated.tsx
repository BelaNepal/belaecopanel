import React, { useEffect } from 'react';
import { useThemeStore } from '@/stores';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark } = useThemeStore();

  useEffect(() => {
    // Apply dark mode class to html element
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
