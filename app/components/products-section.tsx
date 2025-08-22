import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, MapPin, Clock } from "lucide-react";
import Image from "next/image";

const services = [
  {
    id: 1,
    name: "Transporte Local",
    description:
      "Transporte de contenedores dentro de la ciudad y área metropolitana",
    image: "/container-truck-city.png",
    category: "Local",
    status: "Disponible",
    icon: MapPin,
  },
  {
    id: 2,
    name: "Transporte Interestatal",
    description: "Servicios de larga distancia entre estados y regiones",
    image: "/placeholder-p9png.png",
    category: "Larga Distancia",
    status: "Disponible",
    icon: Truck,
  },
  {
    id: 3,
    name: "Carga Especializada",
    description: "Transporte de contenedores con carga frágil o peligrosa",
    image: "/specialized-hazmat-truck.png",
    category: "Especializado",
    status: "Premium",
    icon: Package,
  },
  {
    id: 4,
    name: "Servicio Express",
    description: "Entregas urgentes con horarios prioritarios",
    image: "/urgent-delivery-truck.png",
    category: "Express",
    status: "Popular",
    icon: Clock,
  },
];

export function ProductsSection() {
  return (
    <section id="servicios" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Nuestros Servicios
          </h2>
          <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Ofrecemos servicios completos de transporte de contenedores con
            diferentes modalidades para satisfacer todas tus necesidades
            logísticas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={service.id}
                className="bg-card hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    <Badge
                      variant={
                        service.status === "Premium" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {service.status}
                    </Badge>
                  </div>
                  <Image
                    width={600}
                    height={400}
                    src={service.image || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-24 sm:h-32 object-cover rounded-md mb-3 sm:mb-4"
                  />
                  <CardTitle className="font-serif font-bold text-base sm:text-lg text-card-foreground">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="font-sans text-sm leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <span className="font-sans text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {service.category}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto bg-transparent"
                    >
                      Cotizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            Ver Todos los Servicios
          </Button>
        </div>
      </div>
    </section>
  );
}
