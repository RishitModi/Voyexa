{step === 5 && (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
        <div className="bg-white/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400 mb-8">
            <Sparkles size={32} />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">Travel Preferences</h1>
        <p className="text-slate-400 mb-10 font-medium">
            Tell us how you want to stay and travel.
        </p>

        <div className="space-y-4 mb-8">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                Accommodation preference
            </label>
            <div className="grid grid-cols-2 gap-4">
                {accommodationOptions.map((option) => (
                    <button
                        key={option}
                        onClick={() =>
                            setTripConfig({ ...tripConfig, accommodationPreference: option })
                        }
                        className={`p-4 rounded-2xl border-2 font-bold text-left transition-all ${
                            tripConfig.accommodationPreference === option
                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-4 mb-10">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                Pace of trip
            </label>
            <div className="grid grid-cols-3 gap-4">
                {tripPaceOptions.map((option) => (
                    <button
                        key={option}
                        onClick={() => setTripConfig({ ...tripConfig, tripPace: option })}
                        className={`p-4 rounded-2xl border-2 font-bold text-center transition-all ${
                            tripConfig.tripPace === option
                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex gap-4">
            <button
                onClick={() => setStep(4)}
                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
            >
                Back
            </button>
            <button
                onClick={() => setStep(6)}
                className="flex-[2] bg-white text-slate-950 py-5 rounded-2xl font-black transition-all"
            >
                Continue
            </button>
        </div>
    </div>
)}
