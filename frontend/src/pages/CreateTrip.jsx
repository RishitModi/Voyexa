import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  MapPinned,
  Users,
  Wallet,
  Sparkles,
  ChevronRight,
  Calendar,
  User,
  Heart,
  Users2,
  Ship,
  Plus,
  Minus,
  Search
} from "lucide-react";

const CreateTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tripConfig, setTripConfig] = useState({
    origin: "",      // New Field
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "Solo",
    peopleCount: 1,
    budget: "Moderate",
  });

  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(null); // Tracks which field is searching: 'origin' or 'destination'
  const [loading, setLoading] = useState(false);

  const travelerOptions = [
    { id: "Solo", label: "Solo Traveler", icon: <User size={20} /> },
    { id: "Couple", label: "Couple", icon: <Heart size={20} /> },
    { id: "Family", label: "Family", icon: <Users2 size={20} /> },
    { id: "Friends", label: "Friends", icon: <Ship size={20} /> },
  ];

  const updateCount = (val) => {
    const newCount = tripConfig.peopleCount + val;
    if (newCount >= 1 && newCount <= 20) {
      setTripConfig({ ...tripConfig, peopleCount: newCount });
    }
  };

  // Generic Search Logic for both Origin and Destination
  useEffect(() => {
    const activeQuery = showSuggestions === 'origin' ? tripConfig.origin : tripConfig.destination;

    if (!activeQuery || activeQuery.length < 2) {
      setPlaceSuggestions([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      searchPlaces(activeQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [tripConfig.origin, tripConfig.destination, showSuggestions]);

  const searchPlaces = async (query) => {
    try {
      const response = await fetch(`http://localhost:8080/api/trips/places/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setPlaceSuggestions(data);
      setLoading(false);
    } catch (error) {
      console.error("Error searching places:", error);
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place) => {
    if (showSuggestions === 'origin') {
      setTripConfig({ ...tripConfig, origin: place.displayName });
    } else {
      setTripConfig({ ...tripConfig, destination: place.displayName });
    }
    setShowSuggestions(null);
    setPlaceSuggestions([]);
  };

  return (
      <div className="min-h-screen flex flex-col items-center py-16 px-6 relative overflow-hidden bg-transparent">
        {/* Aurora Blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Progress Header */}
        <div className="w-full max-w-2xl flex justify-between items-center mb-12 relative z-10">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold">
            <ArrowLeft size={20} /> Dashboard
          </button>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => ( // Updated to 4 steps
                <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= i ? "bg-indigo-500 w-14" : "bg-white/10"}`} />
            ))}
          </div>
        </div>

        <div className="w-full max-w-2xl bg-[#0a0f1d]/80 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border border-white/10 relative z-10">

          {/* STEP 1: STARTING LOCATION */}
          {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400 mb-8">
                  <MapPinned size={32} />
                </div>
                <h1 className="text-4xl font-black text-white mb-2">Starting Point</h1>
                <p className="text-slate-400 mb-10 font-medium">Where are you beginning your journey from?</p>
                <div className="relative">
                  <input
                      type="text"
                      placeholder="Current City or Airport"
                      className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-xl outline-none focus:border-indigo-500 text-white placeholder:text-slate-600 transition-all"
                      value={tripConfig.origin}
                      onFocus={() => setShowSuggestions('origin')}
                      onChange={(e) => setTripConfig({ ...tripConfig, origin: e.target.value })}
                  />
                  {showSuggestions === 'origin' && placeSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b2c] border border-white/10 rounded-2xl shadow-2xl z-20 max-h-72 overflow-y-auto">
                        {placeSuggestions.map((place, index) => (
                            <button key={index} onClick={() => handlePlaceSelect(place)} className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 flex flex-col">
                              <span className="font-bold text-white">{place.displayName}</span>
                            </button>
                        ))}
                      </div>
                  )}
                </div>
                <button disabled={!tripConfig.origin} onClick={() => setStep(2)} className="w-full mt-12 bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20">
                  Set Destination <ChevronRight size={20} />
                </button>
              </div>
          )}

          {/* STEP 2: TARGET LOCATION */}
          {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-indigo-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-500/20">
                  <MapPin size={32} />
                </div>
                <h1 className="text-4xl font-black text-white mb-2">Target Location</h1>
                <p className="text-slate-400 mb-10 font-medium">Where should the AI build your itinerary?</p>
                <div className="relative">
                  <input
                      type="text"
                      placeholder="e.g. Paris, Zurich, Tokyo"
                      className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-xl outline-none focus:border-indigo-500 text-white placeholder:text-slate-600 transition-all"
                      value={tripConfig.destination}
                      onFocus={() => setShowSuggestions('destination')}
                      onChange={(e) => setTripConfig({ ...tripConfig, destination: e.target.value })}
                  />
                  {showSuggestions === 'destination' && placeSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b2c] border border-white/10 rounded-2xl shadow-2xl z-20 max-h-72 overflow-y-auto">
                        {placeSuggestions.map((place, index) => (
                            <button key={index} onClick={() => handlePlaceSelect(place)} className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 flex flex-col">
                              <span className="font-bold text-white">{place.displayName}</span>
                            </button>
                        ))}
                      </div>
                  )}
                </div>
                <div className="flex gap-4 mt-12">
                  <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all">Back</button>
                  <button disabled={!tripConfig.destination} onClick={() => setStep(3)} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">Continue <ChevronRight size={20} /></button>
                </div>
              </div>
          )}

          {/* STEP 3: LOGISTICS (DATES & GROUP) */}
          {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400 mb-8">
                  <Calendar size={32} />
                </div>
                <h1 className="text-4xl font-black text-white mb-10">Trip Logistics</h1>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Departure</label>
                    <input type="date" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold text-white outline-none focus:border-indigo-500 transition-all color-scheme-dark" value={tripConfig.startDate} onChange={(e) => setTripConfig({ ...tripConfig, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Return</label>
                    <input type="date" min={tripConfig.startDate} className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold text-white outline-none focus:border-indigo-500 transition-all color-scheme-dark" value={tripConfig.endDate} onChange={(e) => setTripConfig({ ...tripConfig, endDate: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Who is traveling?</label>
                  <div className="grid grid-cols-2 gap-4">
                    {travelerOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setTripConfig({ ...tripConfig, travelers: opt.id, peopleCount: opt.id === 'Solo' ? 1 : (opt.id === 'Couple' ? 2 : tripConfig.peopleCount) })}
                            className={`p-5 rounded-2xl border-2 font-bold text-left transition-all flex items-center gap-4 ${tripConfig.travelers === opt.id ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"}`}
                        >
                          {opt.icon} {opt.label}
                        </button>
                    ))}
                  </div>
                </div>

                {tripConfig.travelers !== "Solo" && (
                    <div className="animate-in fade-in zoom-in duration-300 p-6 bg-white/5 border border-white/10 rounded-2xl mb-10 flex items-center justify-between">
                      <div><h4 className="text-white font-bold">Number of Travelers</h4><p className="text-xs text-slate-500">Including adults & kids</p></div>
                      <div className="flex items-center gap-6">
                        <button onClick={() => updateCount(-1)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"><Minus size={18} /></button>
                        <span className="text-2xl font-black text-white w-8 text-center">{tripConfig.peopleCount}</span>
                        <button onClick={() => updateCount(1)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"><Plus size={18} /></button>
                      </div>
                    </div>
                )}

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all">Back</button>
                  <button disabled={!tripConfig.startDate || !tripConfig.endDate} onClick={() => setStep(4)} className="flex-[2] bg-white text-slate-950 py-5 rounded-2xl font-black disabled:opacity-30 transition-all">Continue</button>
                </div>
              </div>
          )}

          {/* STEP 4: BUDGET */}
          {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-amber-500/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-amber-500 mb-8 border border-amber-500/20">
                  <Wallet size={32} />
                </div>
                <h1 className="text-4xl font-black text-white mb-10">Budget Profile</h1>
                <div className="grid grid-cols-1 gap-4 mb-12">
                  {["Cheap", "Moderate", "Luxury"].map((b) => (
                      <button key={b} onClick={() => setTripConfig({ ...tripConfig, budget: b })} className={`p-6 rounded-2xl border-2 font-black text-left transition-all flex justify-between items-center ${tripConfig.budget === b ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"}`}>
                        {b} {tripConfig.budget === b && <Sparkles size={18} />}
                      </button>
                  ))}
                </div>
                <button className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/40">
                  <Sparkles size={24} /> BUILD ITINERARY
                </button>
              </div>
          )}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `.color-scheme-dark { color-scheme: dark; }` }} />
      </div>
  );
};

export default CreateTrip;