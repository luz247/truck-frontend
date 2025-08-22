"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Route as RouteIcon,
  Calculator,
  Navigation,
  AlertCircle,
  MapPin,
  Settings,
} from "lucide-react";

interface RouteInfo {
  distance: string;
  duration: string;
  durationInTraffic: string;
  cost: number;
  route: string;
}

export function RouteCalculator() {
  // UI state
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);

  // Validación
  const [originInvalid, setOriginInvalid] = useState<boolean>(false);
  const [destInvalid, setDestInvalid] = useState<boolean>(false);

  // Predicciones
  const [originPreds, setOriginPreds] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [destPreds, setDestPreds] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [showOriginPreds, setShowOriginPreds] = useState<boolean>(false);
  const [showDestPreds, setShowDestPreds] = useState<boolean>(false);

  // Refs DOM
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Servicios/objetos Google Maps
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(
    null
  );
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const placesSvc = useRef<google.maps.places.PlacesService | null>(null);
  const acSvc = useRef<google.maps.places.AutocompleteService | null>(null);
  const originToken =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const destToken = useRef<google.maps.places.AutocompleteSessionToken | null>(
    null
  );

  const originMarker = useRef<google.maps.Marker | null>(null);
  const destinationMarker = useRef<google.maps.Marker | null>(null);

  // Coordenadas confirmadas
  const originLL = useRef<google.maps.LatLngLiteral | null>(null);
  const destLL = useRef<google.maps.LatLngLiteral | null>(null);

  /** Inicializa el mapa y servicios (sin “any”) */
  const initializeMap = useCallback((): void => {
    if (!(window as any).google || !mapRef.current) return;

    const center: google.maps.LatLngLiteral = { lat: -33.4489, lng: -70.6693 }; // Santiago

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    // Tráfico en vivo
    new google.maps.TrafficLayer().setMap(mapInstance.current);

    directionsService.current = new google.maps.DirectionsService();
    directionsRenderer.current = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#0ea5e9",
        strokeOpacity: 0.9,
        strokeWeight: 4,
      },
    });
    directionsRenderer.current.setMap(mapInstance.current);

    geocoder.current = new google.maps.Geocoder();
    placesSvc.current = new google.maps.places.PlacesService(
      mapInstance.current!
    );
    acSvc.current = new google.maps.places.AutocompleteService();

    // Marcador de origen inicial
    originMarker.current = new google.maps.Marker({
      map: mapInstance.current,
      position: center,
      title: "Origen",
      icon: { url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png" },
    });

    // Click = fijar destino + reverse geocoding
    mapInstance.current.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const ll: google.maps.LatLngLiteral = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      destLL.current = ll;
      setDestination(`${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`);
      setDestInvalid(false);

      // marcador destino
      if (destinationMarker.current) destinationMarker.current.setMap(null);
      destinationMarker.current = new google.maps.Marker({
        map: mapInstance.current!,
        position: ll,
        title: "Destino",
        icon: { url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" },
      });

      // reverse geocoding
      geocoder.current!.geocode(
        { location: ll },
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus
        ) => {
          if (
            status === google.maps.GeocoderStatus.OK &&
            results &&
            results[0]
          ) {
            setDestination(results[0].formatted_address);
          }
          calculateRoute(); // calcular aunque no haya address legible
        }
      );
    });
  }, []);

  /** Carga el script de Google Maps */
  const loadGoogleMaps = useCallback((): void => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local");
      return;
    }
    if ((window as any).google?.maps) {
      setIsGoogleMapsLoaded(true);
      initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=__initMaps__&loading=async&language=es&region=CL`;
    script.async = true;
    script.defer = true;

    (window as any).__initMaps__ = () => {
      setIsGoogleMapsLoaded(true);
      initializeMap();
    };
    script.onerror = () => {
      setError(
        "No se pudo cargar Google Maps. Revisa la key, facturación y APIs habilitadas."
      );
    };
    document.head.appendChild(script);
  }, [initializeMap]);

  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  /** Pide predicciones de direcciones (AutocompleteService) */
  const requestPredictions = (kind: "origin" | "dest", text: string): void => {
    if (!acSvc.current) return;

    const tokenRef = kind === "origin" ? originToken : destToken;

    if (!tokenRef.current) {
      tokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }

    acSvc.current.getPlacePredictions(
      {
        input: text,
        sessionToken: tokenRef.current,
        componentRestrictions: { country: "cl" },
        types: ["address"],
      },
      (
        preds: google.maps.places.AutocompletePrediction[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !preds) {
          if (kind === "origin") {
            setOriginPreds([]);
            setShowOriginPreds(false);
          } else {
            setDestPreds([]);
            setShowDestPreds(false);
          }
          return;
        }
        if (kind === "origin") {
          setOriginPreds(preds);
          setShowOriginPreds(true);
        } else {
          setDestPreds(preds);
          setShowDestPreds(true);
        }
      }
    );
  };

  /** Toma una predicción y obtiene detalles (coordenadas) */
  const pickPrediction = (
    kind: "origin" | "dest",
    pred: google.maps.places.AutocompletePrediction
  ): void => {
    if (!placesSvc.current || !pred.place_id) return;

    placesSvc.current.getDetails(
      { placeId: pred.place_id, fields: ["geometry", "formatted_address"] },
      (
        place: google.maps.places.PlaceResult | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !place?.geometry?.location
        )
          return;

        const ll: google.maps.LatLngLiteral = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        const addr = place.formatted_address ?? pred.description;

        if (kind === "origin") {
          originLL.current = ll;
          setOrigin(addr);
          setOriginInvalid(false);
          setShowOriginPreds(false);

          if (originMarker.current) originMarker.current.setMap(null);
          originMarker.current = new google.maps.Marker({
            map: mapInstance.current!,
            position: ll,
            title: "Origen",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            },
          });
          mapInstance.current!.panTo(ll);
        } else {
          destLL.current = ll;
          setDestination(addr);
          setDestInvalid(false);
          setShowDestPreds(false);

          if (destinationMarker.current) destinationMarker.current.setMap(null);
          destinationMarker.current = new google.maps.Marker({
            map: mapInstance.current!,
            position: ll,
            title: "Destino",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            },
          });
          calculateRoute();
        }
      }
    );
  };

  /** Geocodifica texto libre si el usuario no eligió de la lista */
  const validateFreeText = (kind: "origin" | "dest"): void => {
    const txt = (
      kind === "origin"
        ? originInputRef.current?.value
        : destinationInputRef.current?.value
    )?.trim();
    if (!txt || !geocoder.current) return;

    geocoder.current.geocode(
      { address: txt, componentRestrictions: { country: "CL" } },
      (
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus
      ) => {
        const ok =
          status === google.maps.GeocoderStatus.OK &&
          !!results?.[0]?.geometry?.location;
        const ll: google.maps.LatLngLiteral | null = ok
          ? {
              lat: results![0].geometry!.location!.lat(),
              lng: results![0].geometry!.location!.lng(),
            }
          : null;

        if (kind === "origin") {
          if (ok && ll) {
            originLL.current = ll;
            setOrigin(results![0].formatted_address);
            setOriginInvalid(false);

            if (originMarker.current) originMarker.current.setMap(null);
            originMarker.current = new google.maps.Marker({
              map: mapInstance.current!,
              position: ll,
              title: "Origen",
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              },
            });
          } else setOriginInvalid(true);
        } else {
          if (ok && ll) {
            destLL.current = ll;
            setDestination(results![0].formatted_address);
            setDestInvalid(false);

            if (destinationMarker.current)
              destinationMarker.current.setMap(null);
            destinationMarker.current = new google.maps.Marker({
              map: mapInstance.current!,
              position: ll,
              title: "Destino",
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              },
            });
            calculateRoute();
          } else setDestInvalid(true);
        }
      }
    );
  };

  /** Calcula ruta con tráfico en vivo (sin `any`) */
  const calculateRoute = (): void => {
    if (!directionsService.current || !directionsRenderer.current) return;

    if (!originLL.current || !destLL.current) {
      setError("Indica un origen y un destino válidos.");
      return;
    }

    setLoading(true);
    setError("");

    const req: google.maps.DirectionsRequest = {
      origin: originLL.current,
      destination: destLL.current,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: google.maps.TrafficModel.BEST_GUESS,
      },
      unitSystem: google.maps.UnitSystem.METRIC,
      region: "cl",
    };

    directionsService.current.route(
      req,
      (
        result: google.maps.DirectionsResult | null,
        status: google.maps.DirectionsStatus
      ) => {
        setLoading(false);

        const leg: google.maps.DirectionsLeg | undefined =
          result?.routes?.[0]?.legs?.[0];
        if (status === google.maps.DirectionsStatus.OK && leg) {
          const distance = leg.distance?.text ?? "";
          const duration = leg.duration?.text ?? "";
          const durationInTraffic =
            (leg as any).duration_in_traffic?.text ?? duration; // propiedad no tipada en DT

          const km = (leg.distance?.value ?? 0) / 1000;
          const cost = Math.round(km * 500);

          setRouteInfo({
            distance,
            duration,
            durationInTraffic,
            cost,
            route: `${origin} → ${destination}`,
          });

          directionsRenderer.current!.setDirections(result);

          const bounds = new google.maps.LatLngBounds();
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
          mapInstance.current!.fitBounds(bounds);
        } else {
          setError("No se pudo calcular la ruta. Verifica las direcciones.");
        }
      }
    );
  };

  // =================== RENDER ===================
  return (
    <section id="mapa" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-foreground mb-4">
            Calculadora de Rutas en Tiempo Real
          </h2>
          <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Ingresa direcciones reales y visualiza la ruta con tráfico en vivo
          </p>
        </div>

        {error && error.toLowerCase().includes("map") && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Settings className="h-5 w-5" />
                Configuración Requerida
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-700">
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  Variable{" "}
                  <code className="bg-amber-100 px-1 rounded">
                    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  </code>
                </li>
                <li>
                  Habilita: Maps JavaScript, Places, Geocoding y Directions
                </li>
                <li>
                  Activa <strong>Facturación</strong> en el proyecto
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

                  <div className="space-y-6 relative">
                    {/* ORIGEN */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        Dirección de Origen
                      </label>
                      <Input
                        ref={originInputRef}
                        placeholder="Ej: Av. Providencia 1234, Santiago"
                        value={origin}
                        onChange={(e) => {
                          const v = e.target.value;
                          setOrigin(v);
                          setOriginInvalid(false);
                          if (v.length >= 3) requestPredictions("origin", v);
                          else {
                            setOriginPreds([]);
                            setShowOriginPreds(false);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowOriginPreds(false), 150);
                          validateFreeText("origin");
                        }}
                        className={originInvalid ? "border-red-500" : "w-full"}
                        disabled={!isGoogleMapsLoaded}
                      />
                      {showOriginPreds && originPreds.length > 0 && (
                        <ul className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                          {originPreds.map((p) => (
                            <li
                              key={p.place_id}
                              className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                              onMouseDown={() => pickPrediction("origin", p)}
                            >
                              {p.description}
                            </li>
                          ))}
                        </ul>
                      )}
                      {originInvalid && (
                        <p className="text-xs text-red-600">
                          Dirección no válida. Elige una sugerencia o corrige el
                          texto.
                        </p>
                      )}
                    </div>

                    {/* DESTINO */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        Dirección de Destino
                      </label>
                      <Input
                        ref={destinationInputRef}
                        placeholder="Ej: Puerto de Valparaíso, Valparaíso"
                        value={destination}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDestination(v);
                          setDestInvalid(false);
                          if (v.length >= 3) requestPredictions("dest", v);
                          else {
                            setDestPreds([]);
                            setShowDestPreds(false);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowDestPreds(false), 150);
                          validateFreeText("dest");
                        }}
                        className={destInvalid ? "border-red-500" : "w-full"}
                        disabled={!isGoogleMapsLoaded}
                      />
                      {showDestPreds && destPreds.length > 0 && (
                        <ul className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                          {destPreds.map((p) => (
                            <li
                              key={p.place_id}
                              className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                              onMouseDown={() => pickPrediction("dest", p)}
                            >
                              {p.description}
                            </li>
                          ))}
                        </ul>
                      )}
                      {destInvalid && (
                        <p className="text-xs text-red-600">
                          Dirección no válida. Elige una sugerencia o corrige el
                          texto.
                        </p>
                      )}
                    </div>
                  </div>

                  {error && !error.includes("API key") && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      validateFreeText("origin");
                      validateFreeText("dest");
                      setTimeout(calculateRoute, 200);
                    }}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading || !isGoogleMapsLoaded}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {loading
                      ? "Calculando..."
                      : "Calcular Ruta con Tráfico en Vivo"}
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
                      <InfoItem
                        icon={<RouteIcon className="h-5 w-5 text-primary" />}
                        label="Distancia Total"
                        value={routeInfo.distance}
                      />
                      <InfoItem
                        icon={<Clock className="h-5 w-5 text-primary" />}
                        label="Sin Tráfico"
                        value={routeInfo.duration}
                      />
                      <InfoItem
                        icon={<Navigation className="h-5 w-5 text-primary" />}
                        label="Con Tráfico Actual"
                        value={routeInfo.durationInTraffic}
                      />
                      <InfoItem
                        icon={<Calculator className="h-5 w-5 text-primary" />}
                        label="Costo Estimado"
                        value={`$${routeInfo.cost.toLocaleString()} CLP`}
                      />
                    </div>
                    <div className="mt-4 p-3 bg-background rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">
                        Ruta Calculada
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {routeInfo.route}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        * Basado en tráfico en vivo de Google.
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
                    Haz clic en el mapa para fijar el destino o usa las cajas de
                    texto
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div
                    ref={mapRef}
                    className="w-full h-96 lg:h-[500px] rounded-lg border border-border bg-muted"
                    style={{ minHeight: "400px" }}
                  />
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <LegendDot color="bg-green-500" label="Origen" />
                    <LegendDot color="bg-red-500" label="Destino" />
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-1 bg-primary rounded" />
                      <span>Ruta</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center p-3 bg-background/50 rounded-lg">
      <div className="flex items-center justify-center mb-2">{icon}</div>
      <h3 className="font-semibold text-lg">{value}</h3>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 ${color} rounded-full`} />
      <span>{label}</span>
    </div>
  );
}
