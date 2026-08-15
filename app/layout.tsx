import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClientOps Memory AI",
  description: "Persistent organizational memory for client operations, powered by CockroachDB and Amazon Bedrock.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
