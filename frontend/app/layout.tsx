import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";

export const metadata = {
  title: "Fitprogress",
  description: "Analytics-first fitness dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
