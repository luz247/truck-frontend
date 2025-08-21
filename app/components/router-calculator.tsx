"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Route, Calculator } from "lucide-react"

const chileanCities = [
  { name: "Arica", region: "Arica y Parinacota", lat: -18.4783, lng: -70.3126 },
  { name: "Iquique", region: "Tarapacá", lat: -20.2307, lng: -70.1355 },
  { name: "Antofagasta", region: "Antofagasta", lat: -23.6509, lng: -70.3975 },
  { name: "Calama", region: "Antofagasta", lat: -22.4667, lng: -68.9333 },
  { name: "Copiapó", region: "Atacama", lat: -27.3668, lng: -70.3323 },
  { name: "La Serena", region: "Coquimbo", lat: -29.9027, lng: -71.2519 },
  { name: "Valparaíso", region: "Valparaíso", lat: -33.0472, lng: -71.6127 },
  { name: "Santiago", region: "Metropolitana", lat: -33.4489, lng: -70.6693 },
  { name: "Rancagua", region: "O'Higgins", lat: -34.1708, lng: -70.7394 },
  { name: "Talca", region: "Maule", lat: -35.4264, lng: -71.6554 },
  { name: "Concepción", region: "Biobío", lat: -36.8201, lng: -73.0444 },
  { name: "Temuco", region: "La Araucanía", lat: -38.7359, lng: -72.5904 },
  { name: "Valdivia", region: "Los Ríos", lat: -39.8142, lng: -73.2459 },
  { name: "Puerto Montt", region: "Los Lagos", lat: -41.4693, lng: -72.9424 },
  { name: "Coyhaique", region: "Aysén", lat: -45.5752, lng: -72.0662 },
  { name: "Punta Arenas", region: "Magallanes", lat: -53.1638, lng: -70.9171 },
]

export function RouteCalculator() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [routeInfo, setRouteInfo] = useState<{
    distance: number
    duration: string
    cost: number
  } | null>(null)

  const calculateRoute = () => {
    if (!origin || !destination) return

    const originCity = chileanCities.find((city) => city.name === origin)
    const destCity = chileanCities.find((city) => city.name === destination)

    if (!originCity || !destCity) return

    // Cálculo aproximado de distancia usando fórmula haversine
    const R = 6371 // Radio de la Tierra en km
    const dLat = ((destCity.lat - originCity.lat) * Math.PI) / 180
    const dLng = ((destCity.lng - originCity.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((originCity.lat * Math.PI) / 180) *
        Math.cos((destCity.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = Math.round(R * c)

    // Cálculo de tiempo estimado (considerando velocidad promedio de 80 km/h)
    const hours = Math.floor(distance / 80)
    const minutes = Math.round(((distance % 80) / 80) * 60)
    const duration = `${hours}h ${minutes}min`

    // Cálculo de costo estimado ($500 CLP por km)
    const cost = distance * 500

    setRouteInfo({ distance, duration, cost })
  }

  return (
    <section id="mapa" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-foreground mb-4">
            Calculadora de Rutas
          </h2>
          <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Selecciona el origen y destino para calcular la distancia, tiempo estimado y costo del transporte
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Route className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Planifica tu Transporte
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Calcula rutas entre las principales ciudades de Chile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad de Origen</label>
                  <Select value={origin} onValueChange={setOrigin}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {chileanCities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-sm">
                              {city.name} - {city.region}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad de Destino</label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {chileanCities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-sm">
                              {city.name} - {city.region}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={calculateRoute}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!origin || !destination}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Ruta y Costo
              </Button>
            </CardContent>
          </Card>

          {routeInfo && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-primary text-lg sm:text-xl">Información de la Ruta</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Route className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg sm:text-xl">{routeInfo.distance} km</h3>
                    <p className="text-muted-foreground text-sm">Distancia Total</p>
                  </div>

                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg sm:text-xl">{routeInfo.duration}</h3>
                    <p className="text-muted-foreground text-sm">Tiempo Estimado</p>
                  </div>

                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg sm:text-xl">${routeInfo.cost.toLocaleString()} CLP</h3>
                    <p className="text-muted-foreground text-sm">Costo Estimado</p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-background rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">
                    Ruta: {origin} → {destination}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    * Los tiempos y costos son estimados. El precio final puede variar según el tipo de carga,
                    condiciones del camino y servicios adicionales requeridos.
                  </p>
                </div>

                <Button className="w-full mt-4 bg-accent hover:bg-accent/90">Solicitar Cotización Detallada</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
