import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeToggle from "@/components/ui/ThemeToggle";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "סטודיו אתרים | בניית אתרים לעסקים",
    template: "%s | סטודיו אתרים",
  },
  description: "בניית אתרים מהירים, יפים ומותאמים לעסק שלכם.",
};

// Runs during HTML parsing, before first paint, to avoid a theme flash.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      data-theme="light"
      suppressHydrationWarning
      className={`${heebo.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ThemeToggle />
      </body>
    </html>
  );
}
