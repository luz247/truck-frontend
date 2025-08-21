import { Truck, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-6 w-6 text-primary" />
              <span className="font-serif font-black text-lg text-foreground">TruckTracker Pro</span>
            </div>
            <p className="font-sans text-sm text-muted-foreground">
              La solución más confiable para el seguimiento y gestión de flotas comerciales.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-foreground mb-4">Productos</h3>
            <ul className="space-y-2 font-sans text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Sistema GPS
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Monitor de Carga
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Kit Completo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-foreground mb-4">Soporte</h3>
            <ul className="space-y-2 font-sans text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Documentación
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Estado del Sistema
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-foreground mb-4">Empresa</h3>
            <ul className="space-y-2 font-sans text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Carreras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Prensa
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-sans text-sm text-muted-foreground">
            © 2024 TruckTracker Pro. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors">
              Términos de Servicio
            </a>
            <a href="#" className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
