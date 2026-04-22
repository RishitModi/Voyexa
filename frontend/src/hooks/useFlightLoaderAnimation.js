import { useEffect, useMemo, useRef, useState } from "react";
import { resolveCityCoordinates, resolveCityCoordinatesSync } from "../utils/geocoding";

const LOADER_MESSAGES = [
  "Generating your perfect trip...",
  "Preparing your itinerary...",
  "Mapping the best route...",
  "Optimizing your journey...",
  "Discovering hidden gems...",
  "Checking weather patterns across your travel dates...",
  "Balancing sightseeing with downtime...",
  "Finding the most scenic transfer options...",
  "Curating neighborhood-level recommendations...",
  "Matching activities to your travel pace...",
  "Estimating realistic travel times between stops...",
  "Selecting top-rated local experiences...",
  "Building day-by-day flow for your journey...",
  "Personalizing plans for your interests...",
  "Calculating the best arrival window...",
  "Reviewing seasonal highlights at your destination...",
  "Prioritizing iconic landmarks and hidden spots...",
  "Drafting your ideal first-day plan...",
  "Optimizing morning and evening activity slots...",
  "Refining dining suggestions near each stop...",
  "Pairing cultural spots with nearby cafes...",
  "Adjusting plans for local opening hours...",
  "Aligning transfers with comfort and convenience...",
  "Preparing backup options for each day...",
  "Designing an efficient city exploration loop...",
  "Selecting must-do experiences for your profile...",
  "Blending local favorites with signature attractions...",
  "Crafting a smooth airport-to-hotel transition...",
  "Fine-tuning route transitions for less waiting...",
  "Adding high-value photo spots to your plan...",
  "Matching experiences to your budget range...",
  "Optimizing your trip for maximum value...",
  "Planning the best times for popular landmarks...",
  "Cross-checking commute options across the city...",
  "Sequencing activities for minimal backtracking...",
  "Balancing adventure, culture, and relaxation...",
  "Preparing a smart itinerary for every day...",
  "Shortlisting top attractions near your stay...",
  "Filtering experiences based on your preferences...",
  "Building a flexible plan for smooth travel...",
  "Curating local food and cafe recommendations...",
  "Arranging your itinerary by travel zones...",
  "Matching each day to realistic energy levels...",
  "Calculating ideal visit durations per stop...",
  "Selecting the best order for daily activities...",
  "Creating optional evening plans...",
  "Checking crowd trends for major attractions...",
  "Finding high-impact experiences near transit lines...",
  "Improving day structure for better flow...",
  "Preparing comfortable pacing across all days...",
  "Tuning your itinerary for convenience...",
  "Combining iconic highlights with local gems...",
  "Selecting low-stress transfer windows...",
  "Reviewing smart alternatives for busy areas...",
  "Adding buffer time where it matters...",
  "Designing balanced mornings and evenings...",
  "Personalizing recommendations for your group style...",
  "Refining destination highlights just for you...",
  "Preparing a premium travel experience...",
  "Enhancing itinerary quality with local context...",
  "Final checks on route efficiency...",
  "Final checks on activity balance...",
  "Final checks on budget fit...",
  "Final checks on timing and logistics...",
  "Polishing your day-by-day itinerary...",
  "Finalizing your personalized travel plan...",
  "Wrapping up your perfect journey...",
  "Almost there, adding final touches...",
  "Your itinerary is nearly ready...",
];

const toLatLng = (coords) => (coords ? [coords.lat, coords.lon] : null);

const linearPoint = (source, destination, t) => {
  return {
    lat: source.lat + (destination.lat - source.lat) * t,
    lon: source.lon + (destination.lon - source.lon) * t,
  };
};

const linearHeading = (source, destination) => {
  const dLon = destination.lon - source.lon;
  const dLat = destination.lat - source.lat;
  return (Math.atan2(dLat, dLon) * 180) / Math.PI;
};

export const useFlightLoaderAnimation = ({
  source,
  destination,
  loading,
  onFadeComplete,
}) => {
  const [sourceGeo, setSourceGeo] = useState(() => resolveCityCoordinatesSync(source));
  const [destinationGeo, setDestinationGeo] = useState(() => resolveCityCoordinatesSync(destination));
  const [visible, setVisible] = useState(Boolean(loading));
  const [progress, setProgress] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showArrivalMarker, setShowArrivalMarker] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const rafRef = useRef(null);
  const lastTickRef = useRef(0);
  const loopDurationMsRef = useRef(4500);
  const loadingRef = useRef(loading);
  const finishingRef = useRef(false);
  const arrivalTriggeredRef = useRef(false);
  const timeoutIdsRef = useRef([]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    let cancelled = false;

    const fetchCoordinates = async () => {
      const immediateSource = resolveCityCoordinatesSync(source);
      const immediateDestination = resolveCityCoordinatesSync(destination);
      if (!cancelled) {
        if (immediateSource) setSourceGeo(immediateSource);
        if (immediateDestination) setDestinationGeo(immediateDestination);
      }

      try {
        const [resolvedSource, resolvedDestination] = await Promise.all([
          resolveCityCoordinates(source),
          resolveCityCoordinates(destination),
        ]);

        if (!cancelled) {
          setSourceGeo(resolvedSource);
          setDestinationGeo(resolvedDestination);
        }
      } catch (error) {
        console.error("Flight loader geocoding failed:", error);
      }
    };

    fetchCoordinates();
    return () => {
      cancelled = true;
    };
  }, [source, destination]);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setIsFadingOut(false);
      setShowArrivalMarker(false);
      setProgress((current) => (current >= 1 ? 0 : current));
      arrivalTriggeredRef.current = false;
      finishingRef.current = false;
      return;
    }

    if (visible) {
      finishingRef.current = true;
    }
  }, [loading, visible]);

  useEffect(() => {
    if (!visible) return undefined;

    const messageInterval = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % LOADER_MESSAGES.length);
    }, 2000);

    return () => {
      window.clearInterval(messageInterval);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;

    lastTickRef.current = 0;

    const tick = (timestamp) => {
      if (lastTickRef.current === 0) {
        lastTickRef.current = timestamp;
      }

      const delta = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;

      setProgress((current) => {
        const next = current + delta / loopDurationMsRef.current;
        if (next < 1) {
          return next;
        }

        if (loadingRef.current && !finishingRef.current) {
          setLoopCount((count) => count + 1);
          setShowArrivalMarker(false);
          loopDurationMsRef.current = 3800 + Math.random() * 1700;
          return 0;
        }

        return 1;
      });

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [visible]);

  useEffect(() => {
    if (loading || !visible || progress < 1 || arrivalTriggeredRef.current) {
      return undefined;
    }

    arrivalTriggeredRef.current = true;
    setShowArrivalMarker(true);

    const fadeTimer = window.setTimeout(() => {
      setIsFadingOut(true);
    }, 500);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      setIsFadingOut(false);
      setShowArrivalMarker(false);
      setProgress(0);
      finishingRef.current = false;
      arrivalTriggeredRef.current = false;
      if (onFadeComplete) {
        onFadeComplete();
      }
    }, 1250);

    timeoutIdsRef.current.push(fadeTimer, hideTimer);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [loading, progress, visible, onFadeComplete]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, []);

  const straightHeading = useMemo(() => {
    if (!sourceGeo || !destinationGeo) return 0;
    return linearHeading(sourceGeo, destinationGeo);
  }, [sourceGeo, destinationGeo]);

  const curvePoints = useMemo(() => {
    if (!sourceGeo || !destinationGeo) return [];
    const steps = 72;
    return Array.from({ length: steps + 1 }, (_, index) => {
      const t = index / steps;
      const point = linearPoint(sourceGeo, destinationGeo, t);
      return [point.lat, point.lon];
    });
  }, [sourceGeo, destinationGeo]);

  const planePosition = useMemo(() => {
    if (!sourceGeo || !destinationGeo) return null;
    const point = linearPoint(sourceGeo, destinationGeo, progress);
    return {
      lat: point.lat,
      lon: point.lon,
      angle: straightHeading,
    };
  }, [sourceGeo, destinationGeo, progress, straightHeading]);

  const trailPoints = useMemo(() => {
    if (!sourceGeo || !destinationGeo) return [];
    const trailLength = 0.22;
    const from = Math.max(0, progress - trailLength);
    const steps = 20;

    return Array.from({ length: steps + 1 }, (_, index) => {
      const t = from + ((progress - from) * index) / steps;
      const point = linearPoint(sourceGeo, destinationGeo, t);
      return [point.lat, point.lon];
    });
  }, [sourceGeo, destinationGeo, progress]);

  const activeMessage = LOADER_MESSAGES[messageIndex];

  return {
    visible,
    isFadingOut,
    showArrivalMarker,
    progress,
    loopCount,
    sourceCoords: sourceGeo,
    destinationCoords: destinationGeo,
    sourceLatLng: toLatLng(sourceGeo),
    destinationLatLng: toLatLng(destinationGeo),
    curvePoints,
    trailPoints,
    planePosition,
    activeMessage,
  };
};

