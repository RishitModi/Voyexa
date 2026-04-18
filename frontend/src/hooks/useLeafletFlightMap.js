import { useEffect, useRef } from "react";
import L from "leaflet";

const createPlaneIcon = () =>
  L.divIcon({
    className: "flight-plane-marker",
    html: `
      <div class="flight-plane-icon-shell">
        <svg viewBox="0 0 64 64" aria-hidden="true" class="flight-plane-svg">
          <path d="M2 34l22 4 16 20 5-2-8-21 18 3 6 8 3-1-3-10 3-10-3-1-6 8-18 3 8-21-5-2-16 20-22 4z" />
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

export const useLeafletFlightMap = ({
  visible,
  loading,
  source,
  destination,
  sourceLatLng,
  destinationLatLng,
  curvePoints,
  trailPoints,
  planePosition,
  progress,
  showArrivalMarker,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const sourceMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeGlowRef = useRef(null);
  const routeMainRef = useRef(null);
  const trailRef = useRef(null);
  const planeMarkerRef = useRef(null);
  const arrivalZoomedRef = useRef(false);
  const hasFittedBoundsRef = useRef(false);

  useEffect(() => {
    if (!visible || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      tap: false,
      preferCanvas: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 6,
      minZoom: 1,
    }).addTo(map);

    map.createPane("routeGlowPane");
    map.createPane("routeMainPane");
    map.getPane("routeGlowPane").style.zIndex = "420";
    map.getPane("routeMainPane").style.zIndex = "430";

    routeGlowRef.current = L.polyline([], {
      pane: "routeGlowPane",
      color: "#38bdf8",
      weight: 8,
      opacity: 0.14,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    routeMainRef.current = L.polyline([], {
      pane: "routeMainPane",
      color: "#93c5fd",
      weight: 2.4,
      opacity: 0.88,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "8 10",
    }).addTo(map);

    trailRef.current = L.polyline([], {
      pane: "routeMainPane",
      color: "#7dd3fc",
      weight: 3.4,
      opacity: 0.5,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    sourceMarkerRef.current = L.circleMarker(sourceLatLng, {
      radius: 6,
      color: "#cbd5e1",
      weight: 1.8,
      fillColor: "#e2e8f0",
      fillOpacity: 0.9,
    })
      .addTo(map)
      .bindTooltip(source, {
        permanent: true,
        direction: "top",
        className: "flight-city-label",
        offset: [0, -8],
      });

    destinationMarkerRef.current = L.circleMarker(destinationLatLng, {
      radius: 6.4,
      color: "#86efac",
      weight: 1.8,
      fillColor: "#4ade80",
      fillOpacity: 0.92,
      className: "flight-destination-marker",
    })
      .addTo(map)
      .bindTooltip(destination, {
        permanent: true,
        direction: "top",
        className: "flight-city-label flight-city-label-destination",
        offset: [0, -8],
      });

    planeMarkerRef.current = L.marker(sourceLatLng, {
      icon: createPlaneIcon(),
      keyboard: false,
      interactive: false,
      zIndexOffset: 900,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      hasFittedBoundsRef.current = false;
      arrivalZoomedRef.current = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !mapRef.current) return;
    mapRef.current.invalidateSize();
  }, [visible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !curvePoints.length) return;

    routeGlowRef.current?.setLatLngs(curvePoints);
    routeMainRef.current?.setLatLngs(curvePoints);
  }, [curvePoints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceLatLng || !destinationLatLng) return;

    sourceMarkerRef.current?.setLatLng(sourceLatLng);
    sourceMarkerRef.current?.setTooltipContent(source);
    destinationMarkerRef.current?.setLatLng(destinationLatLng);
    destinationMarkerRef.current?.setTooltipContent(destination);

    const shouldRefit = !hasFittedBoundsRef.current || loading;
    if (!shouldRefit) return;

    const bounds = L.latLngBounds([sourceLatLng, destinationLatLng]);
    map.fitBounds(bounds.pad(0.65), {
      animate: false,
      maxZoom: 5,
    });
    hasFittedBoundsRef.current = true;
  }, [destination, destinationLatLng, loading, source, sourceLatLng]);

  useEffect(() => {
    if (!routeMainRef.current) return;
    routeMainRef.current.setStyle({
      dashOffset: `${Math.round(-progress * 140)}`,
      opacity: 0.78 + ((progress * 17) % 12) / 100,
    });
  }, [progress]);

  useEffect(() => {
    trailRef.current?.setLatLngs(trailPoints || []);
  }, [trailPoints]);

  useEffect(() => {
    if (!planeMarkerRef.current || !planePosition) return;
    planeMarkerRef.current.setLatLng([planePosition.lat, planePosition.lon]);
  }, [planePosition]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !planeMarkerRef.current || !planePosition || !sourceLatLng || !destinationLatLng) return;
    const element = planeMarkerRef.current.getElement();
    if (!element) return;
    const planeNode = element.querySelector(".flight-plane-icon-shell");
    if (!planeNode) return;

    const sourcePoint = map.latLngToLayerPoint(L.latLng(sourceLatLng[0], sourceLatLng[1]));
    const destinationPoint = map.latLngToLayerPoint(L.latLng(destinationLatLng[0], destinationLatLng[1]));
    const pathAngle =
      (Math.atan2(destinationPoint.y - sourcePoint.y, destinationPoint.x - sourcePoint.x) * 180) /
      Math.PI;

    planeNode.style.transform = `translateZ(0) rotate(${pathAngle + 180}deg)`;
    planeNode.style.transformOrigin = "50% 50%";
  }, [destinationLatLng, planePosition, sourceLatLng]);

  useEffect(() => {
    if (!destinationMarkerRef.current) return;

    destinationMarkerRef.current.setStyle({
      radius: showArrivalMarker ? 8.8 : 6.4,
      weight: showArrivalMarker ? 2.4 : 1.8,
      fillOpacity: showArrivalMarker ? 1 : 0.92,
    });

    const pathElement = destinationMarkerRef.current._path;
    if (!pathElement) return;
    pathElement.classList.toggle("flight-destination-pulse", showArrivalMarker);
  }, [showArrivalMarker]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading || !showArrivalMarker || arrivalZoomedRef.current) return;

    arrivalZoomedRef.current = true;
    map.flyTo(destinationLatLng, Math.min(6, map.getZoom() + 1.3), {
      duration: 0.9,
      easeLinearity: 0.25,
    });
  }, [destinationLatLng, loading, showArrivalMarker]);

  useEffect(() => {
    if (loading) {
      arrivalZoomedRef.current = false;
    }
  }, [loading]);

  return {
    mapContainerRef,
  };
};

