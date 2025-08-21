import { ContactSection } from "./components/contact-section";
import {  Footer } from "./components/footer";
import { Header } from "./components/header";
import { HeroSection } from "./components/hero-section";
import { ProductsSection } from "./components/products-section";
import { RouteCalculator } from "./components/router-calculator";
import { WhatsAppFloat } from "./components/whatsapp-float";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ProductsSection />
      <RouteCalculator />
      <ContactSection />
      <Footer />
       <WhatsAppFloat />
    </main>
  )
}
