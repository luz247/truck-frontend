"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Clock, Route, Calculator, Navigation, AlertCircle, MapPin, Settings, CreditCard } from 'lucide-react'

interface RouteInfo {
  distance: string
  duration: string
  durationInTraffic: string
  cost: number
  route: string
}

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

export function RouteCalculator() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  const originInputRef = useRef<HTMLInputElement>(null)
  const destinationInputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const originAutocomplete = useRef<google.maps.places.Autocomplete | null>(null)
  const destinationAutocomplete = useRef<google.maps.places.Autocomplete | null>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null)

  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current) return

    const chileCenter = { lat: -33.4489, lng: -70.6693 } // Santiago, Chile

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 6,
      center: chileCenter,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    })

    // Configurando DirectionsRenderer para mostrar la ruta correctamente
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      draggable: false,
      suppressMarkers: false, // Mostrar marcadores automáticos
      polylineOptions: {
        strokeColor: "#0ea5e9",
        strokeWeight: 5,
        strokeOpacity: 0.9,
      },
      markerOptions: {
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
        }
      }
    })
    directionsRenderer.current.setMap(mapInstance.current)
  }, [])

  const initializeAutocomplete = useCallback(() => {
    if (!window.google || !originInputRef.current || !destinationInputRef.current) return

    const options = {
      componentRestrictions: { country: "cl" },
      fields: ["formatted_address", "geometry", "name"],
      types: ["establishment", "geocode"],
    }

    try {
      originAutocomplete.current = new window.google.maps.places.Autocomplete(originInputRef.current, options)
      destinationAutocomplete.current = new window.google.maps.places.Autocomplete(destinationInputRef.current, options)

      originAutocomplete.current.addListener("place_changed", () => {
        const place = originAutocomplete.current?.getPlace()
        if (place?.formatted_address) {
          setOrigin(place.formatted_address)
          // Removiendo marcadores manuales ya que DirectionsRenderer los maneja
        }
      })

      destinationAutocomplete.current.addListener("place_changed", () => {
        const place = destinationAutocomplete.current?.getPlace()
        if (place?.formatted_address) {
          setDestination(place.formatted_address)
          // Removiendo marcadores manuales ya que DirectionsRenderer los maneja
        }
      })
    } catch (error) {
      console.error("[v0] Error inicializando autocomplete:", error)
      setError("Error al inicializar el autocompletado de direcciones")
    }
  }, [])

  const calculateRoute = useCallback(async () => {
    if (!origin || !destination || !window.google) {
      setError("Por favor ingresa origen y destino válidos")
      return
    }

    setLoading(true)
    setError("")

    try {
      const directionsService = new window.google.maps.DirectionsService()

      const request: google.maps.DirectionsRequest = {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
        },
        unitSystem: window.google.maps.UnitSystem.METRIC,
        region: "cl",
      }

      directionsService.route(
        request,
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === "OK" && result?.routes[0]) {
            const route = result.routes[0].legs[0]
            const distance = route.distance?.text || ""
            const duration = route.duration?.text || ""
            const durationInTraffic =
              (route as google.maps.DirectionsLeg & { duration_in_traffic?: google.maps.Duration })?.duration_in_traffic
                ?.text || duration

            const distanceValue = (route.distance?.value || 0) / 1000 // convertir a km
            const cost = Math.round(distanceValue * 500)

            setRouteInfo({
              distance,
              duration,
              durationInTraffic,
              cost,
              route: `${origin} → ${destination}`,
            })

            // Asegurando que la ruta se dibuje correctamente en el mapa
            if (directionsRenderer.current && mapInstance.current) {
              directionsRenderer.current.setDirections(result)
              
              // Ajustar el zoom para mostrar toda la ruta
              const bounds = new window.google.maps.LatLngBounds()
              bounds.extend(result.routes[0].legs[0].start_location)
              bounds.extend(result.routes[0].legs[0].end_location)
              mapInstance.current.fitBounds(bounds)
            }
          } else {
            setError("No se pudo calcular la ruta. Verifica las direcciones ingresadas.")
          }
          setLoading(false)
        },
      )
    } catch (err) {
      setError("Error al calcular la ruta. Inténtalo nuevamente.")
      setLoading(false)
    }
  }, [origin, destination])

  useEffect(() => {
    const loadGoogleMaps = () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

      if (!apiKey) {
        setError(
          "API key de Google Maps no configurada. Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a tus variables de entorno.",
        )
        return
      }

      if (window.google) {
        setIsGoogleMapsLoaded(true)
        initializeMap()
        initializeAutocomplete()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap&loading=async`
      script.async = true
      script.defer = true

      window.initMap = () => {
        console.log("[v0] Google Maps cargado exitosamente")
        setIsGoogleMapsLoaded(true)
        initializeMap()
        initializeAutocomplete()
      }

      script.onerror = (error) => {
        console.error("[v0] Error cargando Google Maps:", error)
        setError("Error al cargar Google Maps. Verifica tu configuración de API.")
      }

      window.addEventListener("error", (event) => {
        if (event.message && event.message.includes("BillingNotEnabledMapError")) {
          setError("billing_error")
        } else if (event.message && event.message.includes("InvalidKeyMapError")) {
          setError("invalid_key_error")
        }
      })

      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [initializeMap, initializeAutocomplete])

  return (
    <section id="mapa" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-foreground mb-4">
            Calculadora de Rutas en Tiempo Real
          </h2>
          <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Ingresa direcciones reales y visualiza la ruta en el mapa con cálculos precisos de tráfico en vivo
          </p>
        </div>

        {error === "billing_error" && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <CreditCard className="h-5 w-5" />
                Facturación Requerida
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-700">
              <p className="mb-3">
                Tu API key de Google Maps necesita tener <strong>facturación habilitada</strong>:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Ve a{" "}
                  <a
                    href="https://console.cloud.google.com/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google Cloud Console → Facturación
                  </a>
                </li>
                <li>Habilita la facturación para tu proyecto (incluye $200 USD gratis mensuales)</li>
                <li>Las APIs de Maps requieren facturación habilitada, incluso para uso gratuito</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {error === "invalid_key_error" && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Settings className="h-5 w-5" />
                API Key Inválida
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-700">
              <p className="mb-3">Tu API key no es válida. Verifica:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Que la API key esté correctamente configurada</li>
                <li>Que tengas las APIs habilitadas: Maps JavaScript API, Places API, Directions API</li>
                <li>Que no haya restricciones de dominio bloqueando localhost</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {error && error.includes("API key") && !error.includes("billing") && !error.includes("invalid") && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Settings className="h-5 w-5" />
                Configuración Requerida
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-700">
              <p className="mb-3">Para usar el mapa interactivo, necesitas:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  Agregar tu API key como variable de entorno:{" "}
                  <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
                </li>
                <li>Habilitar estas APIs en Google Cloud Console:</li>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Maps JavaScript API</li>
                  <li>Places API</li>
                  <li>Directions API</li>
                  <li>Geocoding API</li>
                </ul>
                <li>
                  <strong>Habilitar facturación</strong> (requerido para todas las APIs de Maps)
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Planifica tu Transporte con GPS
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Calcula rutas reales con tráfico en tiempo real en Chile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  {!isGoogleMapsLoaded && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Cargando Google Maps...
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        Dirección de Origen
                      </label>
                      <Input
                        ref={originInputRef}
                        placeholder="Ej: Av. Providencia 1234, Santiago"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full"
                        disabled={!isGoogleMapsLoaded}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        Dirección de Destino
                      </label>
                      <Input
                        ref={destinationInputRef}
                        placeholder="Ej: Puerto de Valparaíso, Valparaíso"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full"
                        disabled={!isGoogleMapsLoaded}
                      />
                    </div>
                  </div>

                  {error && !error.includes("API key") && !error.includes("billing") && !error.includes("invalid") && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={calculateRoute}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!origin || !destination || loading || !isGoogleMapsLoaded}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {loading ? "Calculando..." : "Calcular Ruta con Tráfico en Vivo"}
                  </Button>
                </CardContent>
              </Card>

              {routeInfo && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-primary text-lg sm:text-xl">
                      Información de la Ruta en Tiempo Real
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Route className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">{routeInfo.distance}</h3>
                        <p className="text-muted-foreground text-xs">Distancia Total</p>
                      </div>

                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">{routeInfo.duration}</h3>
                        <p className="text-muted-foreground text-xs">Sin Tráfico</p>
                      </div>

                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Navigation className="h-5 w-5 text-accent" />
                        </div>
                        <h3 className="font-semibold text-lg">{routeInfo.durationInTraffic}</h3>
                        <p className="text-muted-foreground text-xs">Con Tráfico Actual</p>
                      </div>

                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Calculator className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">${routeInfo.cost.toLocaleString()} CLP</h3>
                        <p className="text-muted-foreground text-xs">Costo Estimado</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-background rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Ruta Calculada</h4>
                      <p className="text-xs text-muted-foreground mb-2">{routeInfo.route}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        * Cálculos basados en Google Maps con tráfico en tiempo real.
                      </p>
                    </div>

                    <Button className="w-full mt-4 bg-accent hover:bg-accent/90">
                      Solicitar Cotización con Esta Ruta
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Mapa Interactivo
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Visualiza las direcciones y la ruta calculada en tiempo real
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div
                    ref={mapRef}
                    className="w-full h-96 lg:h-[500px] rounded-lg border border-border bg-muted"
                    style={{ minHeight: "400px" }}
                  />
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Origen</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Destino</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-1 bg-primary rounded"></div>
                      <span>Ruta Calculada</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
