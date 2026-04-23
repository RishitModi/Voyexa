import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FlightLoader from "../components/FlightLoader";

const API = import.meta.env.VITE_API_URL;

const FlightLoadingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const payload = state?.payload;

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);

  const source = useMemo(() => payload?.origin?.trim() || "", [payload]);
  const destination = useMemo(() => payload?.destination?.trim() || "", [payload]);

  useEffect(() => {
    if (!payload) {
      navigate("/create-trip", { replace: true });
      return;
    }

    let cancelled = false;

    const generateItinerary = async () => {
      setLoading(true);
      setApiError("");
      setResult(null);

      try {
        const response = await fetch(`${API}/api/trips/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const responseText = await response.text();
          try {
            const errorJson = JSON.parse(responseText);
            throw new Error(errorJson.error || "An unknown API error occurred.");
          } catch {
            throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        if (cancelled) return;

        const hasImmediateItinerary =
          typeof data.itineraryJson === "string" && data.itineraryJson.trim().length > 0;

        if (hasImmediateItinerary) {
          setResult({
            tripId: data.tripId,
            itineraryJson: data.itineraryJson,
          });
          setLoading(false);
          return;
        }

        if (!data.tripId) {
          throw new Error("Trip was created but itinerary is not ready yet. Please try again.");
        }

        for (let attempt = 0; attempt < 60; attempt += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 2000));
          if (cancelled) return;

          const pollResponse = await fetch(
            `${API}/api/trips/${data.tripId}/itinerary`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!pollResponse.ok) {
            continue;
          }

          const pollPayload = await pollResponse.json();
          const itineraryJson =
            typeof pollPayload?.itineraryJson === "string"
              ? pollPayload.itineraryJson
              : typeof pollPayload === "string"
              ? pollPayload
              : null;

          if (itineraryJson && itineraryJson.trim().length > 0) {
            setResult({
              tripId: data.tripId,
              itineraryJson,
            });
            setLoading(false);
            return;
          }
        }

        throw new Error("Itinerary generation is taking longer than expected. Please retry.");
      } catch (error) {
        if (cancelled) return;
        setApiError(error.message || "Network error: Unable to connect to the AI service.");
        setLoading(false);
      }
    };

    generateItinerary();

    return () => {
      cancelled = true;
    };
  }, [navigate, payload]);

  const handleLoaderComplete = useCallback(() => {
    if (!result) return;

    navigate("/itinerary-result", {
      state: result,
      replace: true,
    });
  }, [navigate, result]);

  return (
    <div className="min-h-screen relative bg-transparent">
      <FlightLoader
        source={source}
        destination={destination}
        loading={loading}
        onComplete={handleLoaderComplete}
      />

      {apiError && !loading && (
        <div className="relative z-20 min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-xl bg-[#0a0f1d]/90 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
            <h1 className="text-2xl font-black text-white mb-2">Unable to build itinerary</h1>
            <p className="text-red-200 font-medium">{apiError}</p>
            <button
              onClick={() => navigate("/create-trip")}
              className="mt-8 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-6 py-3 rounded-2xl font-bold"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightLoadingPage;

