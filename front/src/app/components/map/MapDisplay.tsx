"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

/* TIPOS */
interface LocalCoords {
  long: number;
  lat: number;
}

/* COMPONENTE*/
export default function MapDisplay() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);

  const [coords, setCoords] = useState<LocalCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /*   1. OBTENER COORDS DEL BACKEND*/
  useEffect(() => {
    const fetchLocalCoords = async () => {
      setIsLoading(true);

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error("BACKEND_URL no definida en el frontend");
        }

        const response = await fetch(
          `${backendUrl}/api/directions/local`
        );

        if (!response.ok) {
          throw new Error(
            `Backend respondió ${response.status}`
          );
        }

        const data = await response.json();

        setCoords({
          long: data.long,
          lat: data.lat,
        });
      } catch (error) {
        console.error(
          "No se pudo cargar la ubicación del local:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocalCoords();
  }, []);

  /*  2. INICIALIZAR MAPA*/
  useEffect(() => {
    if (map.current || !mapContainer.current || !coords) return;

    const maptilerKey =
      process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

    if (!maptilerKey) {
      console.error(
        "Falta NEXT_PUBLIC_MAPTILER_API_KEY"
      );
      return;
    }

    maptilersdk.config.apiKey = maptilerKey;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [coords.long, coords.lat],
      zoom: 14,
    });

    map.current.on("load", () => {
      // Marcador del local
      new maptilersdk.Marker({ color: "#FF0000" })
        .setLngLat([coords.long, coords.lat])
        .setPopup(
          new maptilersdk.Popup().setHTML(
            "<strong>Nuestra ubicación</strong>"
          )
        )
        .addTo(map.current!);

      // Geolocalización + ruta
      obtenerUbicacionYCalcularRuta(
        coords.long,
        coords.lat
      );
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [coords]);

//   /  3. GEOLOCALIZACIÓN */
  const obtenerUbicacionYCalcularRuta = (
    localLong: number,
    localLat: number
  ) => {
    if (!navigator.geolocation) {
      console.warn("Geolocalización no soportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const clientLong = position.coords.longitude;
        const clientLat = position.coords.latitude;

        const clientCoords: [number, number] = [
          clientLong,
          clientLat,
        ];

        if (map.current) {
          // Marcador cliente
          new maptilersdk.Marker({ color: "#00AA00" })
            .setLngLat(clientCoords)
            .setPopup(
              new maptilersdk.Popup().setHTML(
                "<strong>Tu posición</strong>"
              )
            )
            .addTo(map.current);

          // Ajustar vista
          const bounds =
            new maptilersdk.LngLatBounds(
              clientCoords,
              [localLong, localLat]
            );

          map.current.fitBounds(bounds, {
            padding: 50,
          });
        }

        llamarBackendYDibujarRuta(
          clientLong,
          clientLat
        );
      },
      (error) => {
        let errorMessage = 'Error desconocido';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
          default:
            errorMessage = error.message || 'Error desconocido';
        }
        console.warn("Error al obtener ubicación del cliente:", errorMessage, error.code);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  
    //  4. PROXY BACKEND → RUTA
  
  const llamarBackendYDibujarRuta = async (
    clientLong: number,
    clientLat: number
  ) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!backendUrl) {
        throw new Error(
          "BACKEND_URL no definida"
        );
      }

      const response = await fetch(
        `${backendUrl}/api/directions?clientLong=${clientLong}&clientLat=${clientLat}`
      );

      if (!response.ok) {
        // Si el backend no tiene el endpoint, solo log sin lanzar error
        if (response.status === 503 || response.status === 404) {
          console.warn(`⚠️ Endpoint de direcciones no disponible (${response.status}). Mostrando solo ubicación.`);
          return;
        }
        throw new Error(
          `Backend respondió ${response.status}`
        );
      }

      const data = await response.json();

      if (
        data.routes &&
        data.routes.length > 0 &&
        map.current
      ) {
        const routeGeometry =
          data.routes[0].geometry;

        if (map.current.getSource("route")) {
          (
            map.current.getSource(
              "route"
            ) as maptilersdk.GeoJSONSource
          ).setData(routeGeometry);
        } else {
          map.current.addSource("route", {
            type: "geojson",
            data: routeGeometry,
          });

          map.current.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#0070FF",
              "line-width": 6,
              "line-opacity": 0.75,
            },
          });
        }
      }
    } catch (error) {
      console.error(
        "Error al trazar la ruta:",
        error
      );
    }
  };

//   / 5. RENDER/
  if (isLoading) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500">
        Cargando mapa...
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="h-[200px] flex items-center justify-center text-red-500">
        Error al cargar la ubicación
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full h-[140px]"
    />
  );
}
