import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Services from "@/components/sections/Services";
import Portfolio from "@/components/sections/Portfolio";
import CtaBanner from "@/components/sections/CtaBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Services />
      <Portfolio limit={3} />
      <CtaBanner />
    </>
  );
}
