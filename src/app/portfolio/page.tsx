import type { Metadata } from "next";
import Portfolio from "@/components/sections/Portfolio";
import CtaBanner from "@/components/sections/CtaBanner";

export const metadata: Metadata = { title: "תיק עבודות" };

export default function PortfolioPage() {
  return (
    <>
      <Portfolio />
      <CtaBanner />
    </>
  );
}
