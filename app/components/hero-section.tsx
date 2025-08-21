import { Button } from "@/components/ui/button";
import { MapPin, Clock, Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative bg-gradient-to-br from-primary/5 to-accent/5 py-12 sm:py-16 lg:py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
              Transportes <span className="text-primary">Flores</span>
            </h1>
            <p className="font-sans text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              Servicios de transporte de carga pesada con camión especializado
              para contenedores. Rastrea tu envío en tiempo real, conoce
              nuestras capacidades y horarios disponibles.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
              >
                Solicitar Cotización
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
              >
                Ver Recorrido
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 lg:pt-8">
              <div className="text-center">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                <p className="font-sans text-xs sm:text-sm text-muted-foreground">
                  Seguimiento GPS
                </p>
              </div>
              <div className="text-center">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                <p className="font-sans text-xs sm:text-sm text-muted-foreground">
                  Horarios Flexibles
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                <p className="font-sans text-xs sm:text-sm text-muted-foreground">
                  Carga Asegurada
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <img
              src="/placeholder-jsn8r.png"
              alt="Camión de carga transportando contenedores"
              className="rounded-lg shadow-2xl w-full h-auto"
            />
            <div className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-6 bg-card p-3 sm:p-4 rounded-lg shadow-lg border max-w-[200px] sm:max-w-none">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-sans text-xs sm:text-sm text-card-foreground">
                  Disponible - Próximo Viaje
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
