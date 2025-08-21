import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contacto" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif font-black text-3xl lg:text-5xl text-foreground mb-4">
            Contáctanos
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Listo para optimizar tu flota? Nuestro equipo de expertos está aquí
            para ayudarte. Responderemos en menos de 2 horas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="font-serif font-bold text-xl text-card-foreground">
                  Información de Contacto
                </CardTitle>
                <CardDescription className="font-sans">
                  Múltiples formas de comunicarte con nosotros
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-sans font-medium text-card-foreground">
                      Teléfono
                    </p>
                    <p className="font-sans text-sm text-muted-foreground">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-sans font-medium text-card-foreground">
                      Email
                    </p>
                    <p className="font-sans text-sm text-muted-foreground">
                      contacto@trucktracker.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-sans font-medium text-card-foreground">
                      Oficina
                    </p>
                    <p className="font-sans text-sm text-muted-foreground">
                      123 Logistics Ave, Ciudad
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-sans font-medium text-card-foreground">
                      Horario
                    </p>
                    <p className="font-sans text-sm text-muted-foreground">
                      Lun-Vie: 8:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-accent/10 p-6 rounded-lg">
              <h3 className="font-serif font-bold text-lg text-foreground mb-2">
                ¿Necesitas una Demo?
              </h3>
              <p className="font-sans text-sm text-muted-foreground mb-4">
                Agenda una demostración personalizada de 30 minutos con nuestro
                equipo técnico.
              </p>
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                Agendar Demo
              </Button>
            </div>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-serif font-bold text-xl text-card-foreground">
                Envíanos un Mensaje
              </CardTitle>
              <CardDescription className="font-sans">
                Completa el formulario y te responderemos pronto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="nombre"
                    className="font-sans text-sm font-medium"
                  >
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="Tu nombre"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="empresa"
                    className="font-sans text-sm font-medium"
                  >
                    Empresa
                  </Label>
                  <Input
                    id="empresa"
                    placeholder="Nombre de la empresa"
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="font-sans text-sm font-medium"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="telefono"
                    className="font-sans text-sm font-medium"
                  >
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    placeholder="+1 (555) 123-4567"
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="mensaje"
                  className="font-sans text-sm font-medium"
                >
                  Mensaje
                </Label>
                <Textarea
                  id="mensaje"
                  placeholder="Cuéntanos sobre tu flota y necesidades..."
                  className="bg-input min-h-[120px]"
                />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">
                Enviar Mensaje
              </Button>

              <p className="font-sans text-xs text-muted-foreground text-center">
                Al enviar este formulario, aceptas nuestros términos de servicio
                y política de privacidad.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
