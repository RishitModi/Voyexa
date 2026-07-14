import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Sparkles, MapPin, Clock, Sunrise, Sun, Sunset, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { navigateRequiringLogin } from '@/utils/auth';

const sampleDay = {
  dayNumber: 1,
  date: '2026-07-20',
  themeTitle: 'Temples, Tradition & Tokyo Lights',
  logistics: 'Arrive at Narita International Airport (NRT). Take the Narita Express (N\'EX) to Shinjuku Station (~90 min, ¥3,250). Check in at your hotel and freshen up before heading out.',
  morning: {
    activity: {
      title: 'Senso-ji Temple & Nakamise-dori',
      description: 'Start your Tokyo adventure at the city\'s oldest and most iconic Buddhist temple. Walk through the towering Kaminarimon (Thunder Gate), browse the vibrant Nakamise-dori shopping street for traditional snacks like ningyo-yaki and freshly made senbei, then explore the serene temple grounds and five-story pagoda.',
      location: 'Senso-ji Temple - Asakusa, Taito City',
      imageUrl: 'https://images.pexels.com/photos/33297792/pexels-photo-33297792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    whyItFits: 'A quintessential cultural landmark that captures the spirit of old Tokyo — perfect for first-time visitors seeking authentic Japanese heritage.',
    estimatedTime: '2–3 hours',
    costTier: 'Free',
  },
  afternoon: {
    activity: {
      title: 'Shibuya Crossing & Meiji Jingu Shrine',
      description: 'Experience the world\'s busiest pedestrian crossing from the iconic Shibuya Scramble — cross it yourself, then grab a photo from the Shibuya Sky observation deck. Afterwards, take a peaceful stroll through the forested path to Meiji Jingu Shrine, a serene Shinto sanctuary nestled in 170 acres of evergreen forest in the heart of Tokyo.',
      location: 'Shibuya Crossing & Meiji Jingu - Shibuya, Tokyo',
      imageUrl: 'https://images.pexels.com/photos/35827257/pexels-photo-35827257.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    whyItFits: 'The perfect contrast of modern urban energy and peaceful spirituality, giving you the full range of what Tokyo offers in a single afternoon.',
    estimatedTime: '3–4 hours',
    costTier: '$$',
  },
  evening: {
    activity: {
      title: 'Yakitori Alley & Golden Gai Night Walk',
      description: 'Dive into the electric nightlife of Shinjuku with dinner at the atmospheric Omoide Yokocho (Memory Lane), a narrow alley of tiny open-air yakitori stalls dating back to the post-war era. Then wander through the legendary Golden Gai — six narrow alleys packed with over 200 tiny themed bars, each seating only 6–10 people.',
      location: 'Omoide Yokocho & Golden Gai - Shinjuku, Tokyo',
      imageUrl: 'https://images.pexels.com/photos/19848350/pexels-photo-19848350.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    restaurantType: 'Japanese Izakaya / Yakitori',
  },
  travelTip: 'Get a Suica or Pasmo IC card at the airport — it works on all trains, subways, buses, and even convenience stores. It saves you from buying individual tickets and makes navigating Tokyo seamless.',
};

const LandingHero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  const cardBg = isDarkTheme
    ? 'bg-slate-900 border border-slate-700'
    : 'bg-white/5 backdrop-blur-sm border border-white/10';
  const slotBg = isDarkTheme
    ? 'border border-slate-700 bg-slate-800'
    : 'border border-white/10 bg-white/5';

  return (
    <header className="relative overflow-hidden" aria-label="Voyexa introduction">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-40">
        <div className="text-center space-y-8">
          {/* Logo/Brand */}
          <div className="flex justify-center items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Plane aria-hidden="true" className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Voyexa</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
              Your itinerary,{' '}
              <span
                className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent animate-pulse"
                style={{ animationDuration: '4s' }}
              >
                built in seconds
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto font-medium">
              AI-powered travel planning that creates detailed, day-by-day itineraries tailored to your budget, pace, and interests.
            </p>
            <p className="text-sm text-white/40 max-w-2xl mx-auto">
              No account needed to explore. Sign in to save your trips.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-y-3 sm:gap-y-0 sm:gap-x-4 pt-4">
            <Button
              data-testid="hero-get-started-btn"
              onClick={() => navigate('/auth')}
              size="lg"
              className={`px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none ${
                isDarkTheme
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/35'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white hover:shadow-indigo-500/25'
              }`}
            >
              <Sparkles aria-hidden="true" className="w-5 h-5 mr-2" />
              Get started
            </Button>
            <Button
              data-testid="hero-plan-trip-btn"
              onClick={() => navigate('/create-trip')}
              size="lg"
              variant="outline"
              className={`border-2 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-200 w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] focus-visible:outline-none ${
                isDarkTheme
                  ? 'border-slate-700 hover:border-indigo-400/60 bg-slate-900 hover:bg-slate-800 text-slate-100'
                  : 'border-white/20 hover:border-white/40 bg-white/5 text-white'
              }`}
            >
              Plan a trip
            </Button>
          </div>

          {/* ── Sample itinerary preview ── */}
          <div className="hidden md:block pt-10">
            <div className="max-w-3xl mx-auto text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
                Sample itinerary — generated by Voyexa
              </p>

              <div className={`rounded-2xl p-6 ${cardBg}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-6 mb-5">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Tokyo, Japan</h3>
                    <p className="text-sm text-white/60">5 days · Balanced pace · Moderate budget</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-white/50">Generated by Voyexa</p>
                    <p className="text-sm font-semibold text-indigo-300">
                      Day {sampleDay.dayNumber} preview
                    </p>
                  </div>
                </div>

                {/* Day theme */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl font-black text-white/20 leading-none select-none">
                    0{sampleDay.dayNumber}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">
                      {sampleDay.themeTitle}
                    </h4>
                    <p className="text-xs text-white/50">{sampleDay.date}</p>
                  </div>
                </div>

                {/* Logistics */}
                <div className={`rounded-xl px-4 py-3 mb-5 text-xs text-white/50 leading-relaxed ${slotBg}`}>
                  <span className="font-bold text-white/60 uppercase tracking-wider text-[10px]">
                    Logistics:{' '}
                  </span>
                  {sampleDay.logistics}
                </div>

                {/* Timeline slots */}
                <div className="relative space-y-0">
                  {/* Morning */}
                  <div className="relative pl-7 pb-6 border-l-2 border-white/10">
                    <div className="absolute -left-[7px] top-0 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-slate-900 z-10" />
                    <div className={`rounded-xl overflow-hidden ${slotBg} transition-all duration-300 hover:border-indigo-500/40`}>
                      <div className="w-full h-32 relative overflow-hidden">
                        <img src={sampleDay.morning.activity.imageUrl} alt={sampleDay.morning.activity.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                      </div>
                      <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sunrise aria-hidden="true" className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80">
                          Morning
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-white mb-1">
                        {sampleDay.morning.activity.title}
                      </h5>
                      <p className="text-xs text-white/60 leading-relaxed mb-3">
                        {sampleDay.morning.activity.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold text-white/50">
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                          <MapPin aria-hidden="true" className="w-3 h-3 text-rose-400" />
                          {sampleDay.morning.activity.location}
                        </span>
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                          <Clock aria-hidden="true" className="w-3 h-3" />
                          {sampleDay.morning.estimatedTime}
                        </span>
                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                          {sampleDay.morning.costTier}
                        </span>
                      </div>
                      </div>
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="relative pl-7 pb-6 border-l-2 border-white/10">
                    <div className="absolute -left-[7px] top-0 w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-slate-900 z-10" />
                    <div className={`rounded-xl overflow-hidden ${slotBg} transition-all duration-300 hover:border-indigo-500/40`}>
                      <div className="w-full h-32 relative overflow-hidden">
                        <img src={sampleDay.afternoon.activity.imageUrl} alt={sampleDay.afternoon.activity.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                      </div>
                      <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun aria-hidden="true" className="w-4 h-4 text-sky-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400/80">
                          Afternoon
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-white mb-1">
                        {sampleDay.afternoon.activity.title}
                      </h5>
                      <p className="text-xs text-white/60 leading-relaxed mb-3">
                        {sampleDay.afternoon.activity.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold text-white/50">
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                          <MapPin aria-hidden="true" className="w-3 h-3 text-rose-400" />
                          {sampleDay.afternoon.activity.location}
                        </span>
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                          <Clock aria-hidden="true" className="w-3 h-3" />
                          {sampleDay.afternoon.estimatedTime}
                        </span>
                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                          {sampleDay.afternoon.costTier}
                        </span>
                      </div>
                      </div>
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="relative pl-7 pb-0">
                    <div className="absolute -left-[7px] top-0 w-3.5 h-3.5 rounded-full bg-violet-400 border-2 border-slate-900 z-10" />
                    <div className={`rounded-xl overflow-hidden ${slotBg} transition-all duration-300 hover:border-indigo-500/40`}>
                      <div className="w-full h-32 relative overflow-hidden">
                        <img src={sampleDay.evening.activity.imageUrl} alt={sampleDay.evening.activity.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                      </div>
                      <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sunset aria-hidden="true" className="w-4 h-4 text-violet-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400/80">
                          Evening
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-white mb-1">
                        {sampleDay.evening.activity.title}
                      </h5>
                      <p className="text-xs text-white/60 leading-relaxed mb-3">
                        {sampleDay.evening.activity.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold text-white/50">
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                          <MapPin aria-hidden="true" className="w-3 h-3 text-rose-400" />
                          {sampleDay.evening.activity.location}
                        </span>
                        <span className="text-violet-300 bg-violet-400/10 px-2 py-0.5 rounded-md border border-violet-400/20">
                          {sampleDay.evening.restaurantType}
                        </span>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Travel tip */}
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-indigo-600/15 via-transparent to-transparent border border-indigo-500/20">
                  <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] tracking-widest mb-1.5 uppercase">
                    <Lightbulb aria-hidden="true" className="w-3.5 h-3.5" />
                    Voyexa Tip
                  </div>
                  <p className="text-xs text-white/60 italic leading-relaxed">
                    {sampleDay.travelTip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle trust indicator */}
          <div className="pt-8 flex items-center justify-center gap-2 text-sm text-white/60">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Powered by advanced AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHero;

