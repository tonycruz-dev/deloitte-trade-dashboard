import { useEffect, useRef } from "react";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslation } from "react-i18next";
import { appConfig } from "../config/appConfig";
import { getCountryTranslationKey } from "../i18n/countries";
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
  mapPoints?: MapPointDto[];
};

const mapboxToken = appConfig.mapboxToken;
const tradeRouteSourceId = "trade-routes";
const tradePointSourceId = "trade-points";
const tradeRouteGlowLayerId = "trade-routes-glow";
const tradeRouteLayerId = "trade-routes";
const tradeBubbleGlowLayerId = "trade-bubbles-glow";
const tradeBubbleLayerId = "trade-bubbles";
const executiveMapCenter: [number, number] = [35, 22];
const executiveMapZoom = 3.1;
const executiveMapPitch = 40;
const executiveMapBearing = -5;
const saudiFallbackOrigin: MapPointDto = {
  country: "Saudi Arabia",
  latitude: 23.8859,
  longitude: 45.0792,
  value: 18500,
};

function applyExecutiveMapEnhancements(map: mapboxgl.Map) {
  const style = map.getStyle();

  if (!style.layers) {
    return;
  }

  for (const layer of style.layers) {
    if (layer.type === "background") {
      map.setPaintProperty(layer.id, "background-color", "#071523");
      continue;
    }

    if (layer.type === "fill" && layer.id.includes("land")) {
      map.setPaintProperty(layer.id, "fill-color", "#17324a");
      map.setPaintProperty(layer.id, "fill-opacity", 0.94);
      continue;
    }

    if (layer.type === "line" && layer.id.includes("border")) {
      map.setPaintProperty(layer.id, "line-color", "#6b8aa3");
      map.setPaintProperty(layer.id, "line-opacity", 0.52);
      continue;
    }

    if (layer.type === "symbol" && layer.id.includes("country-label")) {
      map.setPaintProperty(layer.id, "text-color", "#dbeafe");
      map.setPaintProperty(layer.id, "text-halo-color", "#0b1625");
      map.setPaintProperty(layer.id, "text-halo-width", 1.1);
      continue;
    }

    if (
      layer.type === "symbol" &&
      (layer.id.includes("settlement") || layer.id.includes("place"))
    ) {
      map.setPaintProperty(layer.id, "text-color", "#bcd2e8");
      map.setPaintProperty(layer.id, "text-halo-color", "#08111d");
      map.setPaintProperty(layer.id, "text-halo-width", 0.9);
    }
  }
}

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

function buildPopupContent(
  country: string,
  value: number,
  metricLabel: string,
) {
  const container = document.createElement("div");
  container.className =
    "min-w-[180px] rounded-xl bg-slate-950/95 p-0 text-white";

  const title = document.createElement("p");
  title.className = "border-b border-slate-800 px-4 py-3 text-sm font-semibold";
  title.textContent = country;

  const label = document.createElement("p");
  label.className =
    "px-4 pt-3 text-[11px] uppercase tracking-[0.24em] text-cyan-300";
  label.textContent = metricLabel;

  const valueText = document.createElement("p");
  valueText.className = "px-4 pb-4 pt-1 text-lg font-semibold text-white";
  valueText.textContent = value.toLocaleString();

  container.append(title, label, valueText);

  return container;
}

function isValidMapPoint(point: MapPointDto) {
  return (
    Boolean(point.country) &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Number.isFinite(point.value) &&
    point.value > 0 &&
    Math.abs(point.latitude) <= 90 &&
    Math.abs(point.longitude) <= 180
  );
}

export default function TradeMap({ mapPoints }: TradeMapProps) {
  const { t } = useTranslation();
  const safeMapPoints = Array.isArray(mapPoints) ? mapPoints : [];
  const validMapPoints = safeMapPoints.filter(isValidMapPoint);

  console.log("TradeMap mapPoints:", mapPoints);
  console.log("Map points from API:", safeMapPoints);

  if (
    import.meta.env.DEV &&
    safeMapPoints.length > 0 &&
    validMapPoints.length !== safeMapPoints.length
  ) {
    console.warn("Ignoring invalid trade map points.", {
      received: safeMapPoints.length,
      valid: validMapPoints.length,
    });
  }

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const originHaloRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const originPointRef = useRef<MapPointDto | undefined>(undefined);
  const mapPointsRef = useRef<MapPointDto[]>(validMapPoints);
  const syncTradeDataRef = useRef<(() => void) | null>(null);

  // eslint-disable-next-line react-hooks/refs
  mapPointsRef.current = validMapPoints;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !mapboxToken) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: executiveMapCenter,
      zoom: executiveMapZoom,
      pitch: executiveMapPitch,
      bearing: executiveMapBearing,
      interactive: true,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      boxZoom: false,
      keyboard: false,
      projection: "mercator",
    });

    map.scrollZoom.enable();
    map.dragPan.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    mapRef.current = map;

    map.on("load", () => {
      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: false,
        }),
        "top-left",
      );

      const controlContainer = map
        .getContainer()
        .querySelector(".mapboxgl-control-container") as HTMLDivElement | null;
      const topLeftControls = map
        .getContainer()
        .querySelector(".mapboxgl-ctrl-top-left") as HTMLDivElement | null;

      controlContainer?.style.setProperty("display", "block");
      topLeftControls?.style.setProperty("padding", "0.75rem");

      applyExecutiveMapEnhancements(map);

      map.setFog({
        color: "rgba(18, 43, 68, 0.42)",
        "high-color": "rgba(27, 79, 112, 0.32)",
        "space-color": "rgba(6, 20, 36, 0.34)",
        "horizon-blend": 0.14,
      });

      map.addSource(tradeRouteSourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        } satisfies FeatureCollection<LineString, TradeRouteProperties>,
      });

      map.addSource(tradePointSourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        } satisfies FeatureCollection<Point, TradeFeatureProperties>,
      });

      map.addLayer({
        id: tradeRouteGlowLayerId,
        type: "line",
        source: tradeRouteSourceId,
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#2dd4bf",
          "line-opacity": 0.16,
          "line-width": ["interpolate", ["linear"], ["zoom"], 1, 5, 3, 9],
          "line-blur": 3.2,
        },
      });

      map.addLayer({
        id: tradeRouteLayerId,
        type: "line",
        source: tradeRouteSourceId,
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#22d3ee",
          "line-opacity": 0.34,
          "line-width": ["interpolate", ["linear"], ["zoom"], 1, 1.25, 3, 2.35],
          "line-blur": 0.35,
          "line-dasharray": [0, 4, 3],
        },
      });

      map.addLayer({
        id: tradeBubbleGlowLayerId,
        type: "circle",
        source: tradePointSourceId,
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
        id: tradeBubbleLayerId,
        type: "circle",
        source: tradePointSourceId,
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

      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 18,
        className: "trade-map-popup",
      });

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
        const saudiPoint = currentMapPoints.find(
          (point) => point.country === "Saudi Arabia",
        );
        const routeOrigin = saudiPoint ?? saudiFallbackOrigin;
        const routeDestinations = currentMapPoints.filter((point) => {
          const isOriginCountry = point.country === routeOrigin.country;
          const sameCoordinates =
            point.longitude === routeOrigin.longitude &&
            point.latitude === routeOrigin.latitude;

          return !isOriginCountry && !sameCoordinates;
        });

        originPointRef.current = routeOrigin;

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
          features: routeDestinations.map(
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

        if (import.meta.env.DEV) {
          console.log(
            "TradeMap route source features:",
            tradeRouteCollection.features,
          );
        }

        const tradePointSource = map.getSource(tradePointSourceId) as
          | mapboxgl.GeoJSONSource
          | undefined;
        const tradeRouteSource = map.getSource(tradeRouteSourceId) as
          | mapboxgl.GeoJSONSource
          | undefined;

        if (!tradePointSource || !tradeRouteSource) {
          if (import.meta.env.DEV) {
            console.warn("TradeMap sources are not ready for live update.");
          }
          return;
        }

        tradePointSource.setData(tradePointCollection);
        tradeRouteSource.setData(tradeRouteCollection);
        updateOriginHaloPosition();
      };

      const animateRoutes = () => {
        if (map.getLayer(tradeRouteLayerId)) {
          dashOffset = (dashOffset + 0.045) % 6;
          map.setPaintProperty(tradeRouteLayerId, "line-dasharray", [
            dashOffset,
            4,
            3,
          ]);
        }

        animationFrameId = window.requestAnimationFrame(animateRoutes);
      };

      syncTradeDataRef.current = syncTradeData;

      animateRoutes();
      syncTradeData();

      map.on("resize", updateOriginHaloPosition);
      map.on("move", updateOriginHaloPosition);

      map.on("mouseenter", tradeBubbleLayerId, (event) => {
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
            buildPopupContent(
              t(getCountryTranslationKey(feature.properties.country)),
              feature.properties.value,
              t("dashboard.totalCustomsDeclarations"),
            ),
          )
          .addTo(map);
      });

      map.on("mouseleave", tradeBubbleLayerId, () => {
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
  }, [validMapPoints]);

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
    <div className="pointer-events-auto relative h-full w-full overflow-hidden">
      <div
        ref={originHaloRef}
        className="pointer-events-none absolute left-0 top-0 z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/30 bg-cyan-400/8 shadow-[0_0_34px_rgba(45,212,191,0.2)] before:absolute before:inset-0 before:rounded-full before:border before:border-cyan-200/35 before:animate-ping before:content-['']"
      />
      <div
        ref={mapContainerRef}
        className="trade-map-canvas pointer-events-auto h-full w-full"
      />
      {validMapPoints.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center">
          <div className="glass-panel max-w-md px-8 py-8">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">
              No Map Points Available
            </p>
            <p className="mt-3 text-sm text-slate-300">
              No valid trade locations were returned by the API for the current
              filters.
            </p>
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,_rgba(21,94,117,0.13),_transparent_28%),radial-gradient(circle_at_82%_10%,_rgba(34,211,238,0.11),_transparent_20%),linear-gradient(180deg,_rgba(2,6,23,0.05)_0%,_rgba(2,6,23,0.08)_18%,_rgba(2,6,23,0.16)_48%,_rgba(2,6,23,0.24)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-slate-950/10 via-slate-950/3 to-transparent" />
    </div>
  );
}
