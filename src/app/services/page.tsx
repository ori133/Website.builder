import type { Metadata } from "next";
import Services from "@/components/sections/Services";
import CtaBanner from "@/components/sections/CtaBanner";

export const metadata: Metadata = { title: "שירותים" };

export default function ServicesPage() {
  return (
    <>
      <Services />
      <CtaBanner />
    </>
  );
}
