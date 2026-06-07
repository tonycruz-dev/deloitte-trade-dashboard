import { useEffect, useRef } from "react";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapPointDto } from "../types/dashboard";

type TradeFeatureProperties = {
  country: string;
  value: number;
};

type TradeRouteProperties = {
  origin: string;
  destination: string;
};

type TradeMapProps = {
  mapPoints: MapPointDto[];
};

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

function buildArcCoordinates(
  start: [number, number],
  end: [number, number],
  bend = 0.18,
  steps = 48,
) {
  const [startLng, startLat] = start;
  const [endLng, endLat] = end;
  const midLng = (startLng + endLng) / 2;
  const midLat = (startLat + endLat) / 2;
  const deltaLng = endLng - startLng;
  const deltaLat = endLat - startLat;
  const distance = Math.sqrt(deltaLng ** 2 + deltaLat ** 2);
  const normalLng = distance === 0 ? 0 : -deltaLat / distance;
  const normalLat = distance === 0 ? 0 : deltaLng / distance;
  const controlPoint: [number, number] = [
    midLng + normalLng * distance * bend,
    midLat + normalLat * distance * bend,
  ];

  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const lng =
      (1 - t) ** 2 * startLng +
      2 * (1 - t) * t * controlPoint[0] +
      t ** 2 * endLng;
    const lat =
      (1 - t) ** 2 * startLat +
      2 * (1 - t) * t * controlPoint[1] +
      t ** 2 * endLat;

    return [lng, lat];
  });
}

function buildPopupContent(country: string, value: number) {
  const container = document.createElement("div");
  container.className = "min-w-[180px] rounded-xl bg-slate-950/95 p-0 text-white";

  const title = document.createElement("p");
  title.className = "border-b border-slate-800 px-4 py-3 text-sm font-semibold";
  title.textContent = country;

  const label = document.createElement("p");
  label.className =
    "px-4 pt-3 text-[11px] uppercase tracking-[0.24em] text-cyan-300";
  label.textContent = "Declaration Volume";

  const valueText = document.createElement("p");
  valueText.className = "px-4 pb-4 pt-1 text-lg font-semibold text-white";
  valueText.textContent = value.toLocaleString();

  container.append(title, label, valueText);

  return container;
}

export default function TradeMap({ mapPoints }: TradeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const originHaloRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const originPointRef = useRef<MapPointDto | null>(null);
  const mapPointsRef = useRef(mapPoints);
  const syncTradeDataRef = useRef<(() => void) | null>(null);

 

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !mapboxToken) {
      return;
    }
    mapPointsRef.current = mapPoints;
    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [42, 27],
      zoom: 2.3,
      interactive: true,
      attributionControl: false,
      dragPan: false,
      scrollZoom: false,
      boxZoom: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      keyboard: false,
      projection: "mercator",
    });

    mapRef.current = map;

    map.on("load", () => {
      map.setFog({
        color: "rgba(11, 31, 52, 0.62)",
        "high-color": "rgba(15, 58, 88, 0.44)",
        "space-color": "rgba(3, 14, 28, 0.62)",
        "horizon-blend": 0.1,
      });

      map.addSource("trade-routes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        } satisfies FeatureCollection<LineString, TradeRouteProperties>,
      });

      map.addSource("trade-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        } satisfies FeatureCollection<Point, TradeFeatureProperties>,
      });

      map.addLayer({
        id: "trade-routes-glow",
        type: "line",
        source: "trade-routes",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#2dd4bf",
          "line-opacity": 0.16,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            1,
            5,
            3,
            9,
          ],
          "line-blur": 3.2,
        },
      });

      map.addLayer({
        id: "trade-routes",
        type: "line",
        source: "trade-routes",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#22d3ee",
          "line-opacity": 0.34,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            1,
            1.25,
            3,
            2.35,
          ],
          "line-blur": 0.35,
          "line-dasharray": [0, 4, 3],
        },
      });

      map.addLayer({
        id: "trade-bubbles-glow",
        type: "circle",
        source: "trade-points",
        paint: {
          "circle-color": "#2dd4bf",
          "circle-opacity": 0.14,
          "circle-blur": 0.45,
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            18500,
            16,
            28368,
            20,
            44120,
            26,
            61750,
            34,
            92300,
            46,
          ],
        },
      });

      map.addLayer({
        id: "trade-bubbles",
        type: "circle",
        source: "trade-points",
        paint: {
          "circle-color": "#22d3ee",
          "circle-opacity": 0.46,
          "circle-stroke-color": "#9ae6f5",
          "circle-stroke-width": 1.2,
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            18500,
            10,
            28368,
            14,
            44120,
            18,
            61750,
            24,
            92300,
            32,
          ],
        },
      });

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 18,
        className: "trade-map-popup",
      });

      popupRef.current = popup;

      let animationFrameId = 0;
      let dashOffset = 0;

      const updateOriginHaloPosition = () => {
        const routeOrigin = originPointRef.current;

        if (!originHaloRef.current || !routeOrigin) {
          if (originHaloRef.current) {
            originHaloRef.current.style.opacity = "0";
          }
          return;
        }

        const projectedPoint = map.project([
          routeOrigin.longitude,
          routeOrigin.latitude,
        ]);

        originHaloRef.current.style.opacity = "1";
        originHaloRef.current.style.transform = `translate(${projectedPoint.x}px, ${projectedPoint.y}px) translate(-50%, -50%)`;
      };

      const syncTradeData = () => {
        const currentMapPoints = mapPointsRef.current;
        const routeOrigin = currentMapPoints.find(
          (point) => point.country === "Saudi Arabia",
        );
        const routeDestinations = currentMapPoints.filter(
          (point) => point.country !== "Saudi Arabia",
        );

        originPointRef.current = routeOrigin ?? null;

        const tradePointCollection: FeatureCollection<
          Point,
          TradeFeatureProperties
        > = {
          type: "FeatureCollection",
          features: currentMapPoints.map(
            (point): Feature<Point, TradeFeatureProperties> => ({
              type: "Feature",
              properties: {
                country: point.country,
                value: point.value,
              },
              geometry: {
                type: "Point",
                coordinates: [point.longitude, point.latitude],
              },
            }),
          ),
        };

        const tradeRouteCollection: FeatureCollection<
          LineString,
          TradeRouteProperties
        > = {
          type: "FeatureCollection",
          features:
            routeOrigin === undefined
              ? []
              : routeDestinations.map(
                  (point): Feature<LineString, TradeRouteProperties> => ({
                    type: "Feature",
                    properties: {
                      origin: routeOrigin.country,
                      destination: point.country,
                    },
                    geometry: {
                      type: "LineString",
                      coordinates: buildArcCoordinates(
                        [routeOrigin.longitude, routeOrigin.latitude],
                        [point.longitude, point.latitude],
                      ),
                    },
                  }),
                ),
        };

        const tradePointSource = map.getSource("trade-points") as
          | mapboxgl.GeoJSONSource
          | undefined;
        const tradeRouteSource = map.getSource("trade-routes") as
          | mapboxgl.GeoJSONSource
          | undefined;

        tradePointSource?.setData(tradePointCollection);
        tradeRouteSource?.setData(tradeRouteCollection);
        updateOriginHaloPosition();
      };

      const animateRoutes = () => {
        dashOffset = (dashOffset + 0.045) % 6;
        map.setPaintProperty("trade-routes", "line-dasharray", [
          dashOffset,
          4,
          3,
        ]);
        animationFrameId = window.requestAnimationFrame(animateRoutes);
      };

      syncTradeDataRef.current = syncTradeData;

      animateRoutes();
      syncTradeData();

      map.on("resize", updateOriginHaloPosition);
      map.on("move", updateOriginHaloPosition);

      map.on("mouseenter", "trade-bubbles", (event) => {
        map.getCanvas().style.cursor = "pointer";

        const feature = event.features?.[0] as
          | Feature<Point, TradeFeatureProperties>
          | undefined;

        if (!feature || !popupRef.current) {
          return;
        }

        const [longitude, latitude] = feature.geometry.coordinates;

        popupRef.current
          .setLngLat([longitude, latitude])
          .setDOMContent(
            buildPopupContent(feature.properties.country, feature.properties.value),
          )
          .addTo(map);
      });

      map.on("mouseleave", "trade-bubbles", () => {
        map.getCanvas().style.cursor = "";
        popupRef.current?.remove();
      });

      map.on("remove", () => {
        window.cancelAnimationFrame(animationFrameId);
      });
    });

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      popupRef.current?.remove();
      window.removeEventListener("resize", handleResize);
      syncTradeDataRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    syncTradeDataRef.current?.();
  }, [mapPoints]);

  if (!mapboxToken) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(2,6,23,1))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,_rgba(45,212,191,0.12),_transparent_0),radial-gradient(circle_at_75%_40%,_rgba(34,211,238,0.1),_transparent_22%)]" />
        <div className="relative flex h-full items-center justify-center px-6 text-center">
          <div className="glass-panel max-w-md px-8 py-8">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">
              Mapbox Token Required
            </p>
            <p className="mt-3 text-sm text-slate-300">
              Set <code>VITE_MAPBOX_TOKEN</code> in your Vite environment to
              render the trade map background.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={originHaloRef}
        className="pointer-events-none absolute left-0 top-0 z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/30 bg-cyan-400/8 shadow-[0_0_34px_rgba(45,212,191,0.2)] before:absolute before:inset-0 before:rounded-full before:border before:border-cyan-200/35 before:animate-ping before:content-['']"
      />
      <div ref={mapContainerRef} className="trade-map-canvas h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,_rgba(15,118,110,0.1),_transparent_24%),radial-gradient(circle_at_82%_12%,_rgba(34,211,238,0.08),_transparent_18%),linear-gradient(180deg,_rgba(2,6,23,0.06)_0%,_rgba(2,6,23,0.1)_22%,_rgba(2,6,23,0.24)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-slate-950/18 via-slate-950/4 to-transparent" />
    </div>
  );
}
