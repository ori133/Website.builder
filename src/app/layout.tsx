import type { Metadata } from "next";
import { Assistant, Rubik } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Display: Rubik (rounded geometric, Hebrew + Latin in one family so mixed headlines stay consistent).
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
});

// Body: Assistant (clean, highly readable Hebrew + Latin).
const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "סטודיו אתרים | בניית אתרים לעסקים",
    template: "%s | סטודיו אתרים",
  },
  description: "בניית אתרים מהירים, יפים ומותאמים לעסק שלכם.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" data-scroll-behavior="smooth"
      className={`${rubik.variable} ${assistant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
