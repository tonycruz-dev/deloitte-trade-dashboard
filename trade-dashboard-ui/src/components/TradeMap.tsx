import { useEffect, useRef } from "react";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type TradePoint = {
  country: string;
  latitude: number;
  longitude: number;
  value: number;
};

const tradePoints: TradePoint[] = [
  {
    country: "China",
    latitude: 35.8617,
    longitude: 104.1954,
    value: 92300,
  },
  {
    country: "India",
    latitude: 20.5937,
    longitude: 78.9629,
    value: 61750,
  },
  {
    country: "Turkey",
    latitude: 38.9637,
    longitude: 35.2433,
    value: 44120,
  },
  {
    country: "Germany",
    latitude: 51.1657,
    longitude: 10.4515,
    value: 28368,
  },
  {
    country: "England",
    latitude: 52.3555,
    longitude: -1.1743,
    value: 18500,
  },
];

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
type TradeFeatureProperties = { country: string; value: number };
type TradeRouteProperties = { origin: string; destination: string };

const routeOrigin = tradePoints.find((point) => point.country === "England");
const routeDestinations = tradePoints.filter((point) => point.country !== "England");

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
  label.className = "px-4 pt-3 text-[11px] uppercase tracking-[0.24em] text-cyan-300";
  label.textContent = "Declaration Volume";

  const valueText = document.createElement("p");
  valueText.className = "px-4 pb-4 pt-1 text-lg font-semibold text-white";
  valueText.textContent = value.toLocaleString();

  container.append(title, label, valueText);

  return container;
}

export default function TradeMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const originHaloRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !mapboxToken) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [15, 28],
      zoom: 1.25,
      attributionControl: false,
      projection: "mercator",
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      const tradePointCollection: FeatureCollection<Point, TradeFeatureProperties> =
        {
          type: "FeatureCollection",
          features: tradePoints.map(
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

      map.addSource("trade-routes", {
        type: "geojson",
        data: tradeRouteCollection,
      });

      map.addSource("trade-points", {
        type: "geojson",
        data: tradePointCollection,
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
        id: "trade-bubbles",
        type: "circle",
        source: "trade-points",
        paint: {
          "circle-color": "#22d3ee",
          "circle-opacity": 0.45,
          "circle-stroke-color": "#67e8f9",
          "circle-stroke-width": 1.5,
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
      let animationFrameId = 0;
      let dashOffset = 0;

      const updateOriginHaloPosition = () => {
        if (!originHaloRef.current || !routeOrigin) {
          return;
        }

        const projectedPoint = map.project([
          routeOrigin.longitude,
          routeOrigin.latitude,
        ]);

        originHaloRef.current.style.transform = `translate(${projectedPoint.x}px, ${projectedPoint.y}px) translate(-50%, -50%)`;
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

      animateRoutes();
      updateOriginHaloPosition();

      map.on("move", updateOriginHaloPosition);
      map.on("zoom", updateOriginHaloPosition);
      map.on("resize", updateOriginHaloPosition);

      map.on("mouseenter", "trade-bubbles", (event) => {
        map.getCanvas().style.cursor = "pointer";

        const feature = event.features?.[0] as
          | Feature<Point, TradeFeatureProperties>
          | undefined;

        if (!feature) {
          return;
        }

        const [longitude, latitude] = feature.geometry.coordinates;
        const country = feature.properties.country;
        const value = feature.properties.value;

        popup
          .setLngLat([longitude, latitude])
          .setDOMContent(buildPopupContent(country, value))
          .addTo(map);
      });

      map.on("mouseleave", "trade-bubbles", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      map.on("remove", () => {
        window.cancelAnimationFrame(animationFrameId);
      });
    });

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-[0_24px_80px_rgba(2,12,27,0.45)]">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/80">
            Global Trade Flow
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Declaration Hotspots
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Bubble size scales with customs declaration volume across key
            markets.
          </p>
        </div>
      </div>

      {!mapboxToken ? (
        <div className="flex h-[500px] w-full items-center justify-center bg-slate-950 px-6 text-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">
              Mapbox Token Required
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Set <code>VITE_MAPBOX_TOKEN</code> in your Vite environment to
              render the trade map.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative h-[500px] w-full">
          <div
            ref={originHaloRef}
            className="pointer-events-none absolute left-0 top-0 z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/35 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.18)] before:absolute before:inset-0 before:rounded-full before:border before:border-cyan-200/40 before:animate-ping before:content-['']"
          />
          <div ref={mapContainerRef} className="h-full w-full" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950 via-slate-950/35 to-transparent" />
        </div>
      )}
    </section>
  );
}
