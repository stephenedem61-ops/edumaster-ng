import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "EduMaster NG | Nigerian Teacher Productivity",
  description: "Plan lessons, create assessments and organise classroom work for Nigerian schools."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
