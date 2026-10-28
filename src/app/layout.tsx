import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PeopleOS",
  description: "HR Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
