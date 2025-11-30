import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers";
import { centuryGothic } from "./fonts";
import CustomConfirmDialog from "@/components/common/confirm-dialog";

export const metadata: Metadata = {
  title: "BAK Timesheet - Human Resources System",
  description:
    "Welcome to BAK United. Since 2008, we have been a trusted name in construction across Saudi Arabia. We are dedicated to delivering excellence in every project, from residential developments to industrial complexes, driven by integrity and quality craftsmanship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${centuryGothic.variable} antialiased`}>
        <Providers>
          <CustomConfirmDialog />
          {children}
        </Providers>
      </body>
    </html>
  );
}
