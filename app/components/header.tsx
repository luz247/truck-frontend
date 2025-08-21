import { Button } from "@/components/ui/button"
import { Truck, Menu } from "lucide-react"

export function Header() {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="h-8 w-8 text-primary" />
          <span className="font-serif font-black text-xl text-foreground">Transportes</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#inicio" className="font-sans text-foreground hover:text-primary transition-colors">
            Inicio
          </a>
          <a href="#servicios" className="font-sans text-foreground hover:text-primary transition-colors">
            Servicios
          </a>
          <a href="#mapa" className="font-sans text-foreground hover:text-primary transition-colors">
            Calcular Ruta
          </a>
          <a href="#contacto" className="font-sans text-foreground hover:text-primary transition-colors">
            Contacto
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button className="bg-accent hover:bg-accent/90">Solicitar Cotización</Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
