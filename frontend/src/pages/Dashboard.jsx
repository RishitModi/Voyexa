import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  Calendar,
  Compass,
  Clock,
  LogOut,
  Search,
  TrendingUp,
  Settings,
  ChevronRight,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const savedTrips = [
    {
      id: 1,
      city: "Tokyo",
      country: "Japan",
      days: 5,
      type: "Solo",
      budget: 1250,
      status: "Completed",
      img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 2,
      city: "Paris",
      country: "France",
      days: 3,
      type: "Couple",
      budget: 980,
      status: "Upcoming",
      img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 3,
      city: "Bali",
      country: "Indonesia",
      days: 7,
      type: "Relax",
      budget: 2100,
      status: "Upcoming",
      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400",
    },
  ];

  return (
      <div className="min-h-screen bg-transparent">

        {/* SIDEBAR:
          - 'fixed left-0 top-0': Locks it to the screen edges.
          - 'h-full': Ensures it spans the entire height.
          - 'z-50': Keeps it above all scrolling content.
      */}
        <aside className="fixed left-0 top-0 w-72 h-full bg-[#0a0f1d]/95 backdrop-blur-xl border-r border-slate-800/50 hidden lg:flex flex-col z-50">
          <div className="p-8 flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <Compass size={24} />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">Voyexa</span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">
              Main Menu
            </div>

            <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all">
              <TrendingUp size={20} /> Dashboard
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-semibold transition-all duration-300 group">
              <Clock size={20} className="group-hover:text-indigo-400 transition-colors" />
              My Trips
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-semibold transition-all duration-300 group">
              <Settings size={20} className="group-hover:text-indigo-400 transition-colors" />
              Settings
            </button>
          </nav>

          <div className="p-6 border-t border-slate-800/50 mt-auto">
            <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl font-bold transition-all group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN AREA:
          - 'ml-72': Crucial! Creates space so content doesn't hide behind the fixed sidebar.
          - No height constraints here so the global page scroll works normally.
      */}
        <main className="lg:ml-72 flex-1 px-6 lg:px-12 py-8 relative z-10">
          <header className="flex justify-between items-center mb-10">
            <div className="relative w-96 hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                  type="text"
                  placeholder="Search itineraries..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-white placeholder:text-slate-500"
              />
            </div>
            <button
                onClick={() => navigate("/create-trip")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Plus size={20} /> Plan New Trip
            </button>
          </header>

          {/* HERO SECTION */}
          <div className="relative mb-12 p-12 rounded-[3rem] overflow-hidden bg-slate-950/40 text-white shadow-2xl border border-white/5 backdrop-blur-md">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>

            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
               <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                v2.0 Beta
              </span>
              </div>
              <h1 className="text-6xl font-black tracking-tighter mb-6 leading-[0.9]">
                Your world, <br />
                <span className="text-indigo-400 italic">optimized.</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed font-medium mb-8">
                AI-driven itineraries for travelers who value time as much as the destination.
              </p>
              <button className="flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition-colors">
                View Analytics <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* GRID SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
            {savedTrips.map((trip) => (
                <div
                    key={trip.id}
                    className="group bg-[#0a0f1d]/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-indigo-500/40 transition-all duration-500 cursor-pointer"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                        src={trip.img}
                        alt={trip.city}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-4 right-4 px-4 py-1.5 bg-[#0a0f1d]/80 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-white uppercase">
                      {trip.type}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-2 text-white">
                      <h3 className="text-2xl font-black">{trip.city}</h3>
                      <div className="text-indigo-400 font-black text-xl">${trip.budget}</div>
                    </div>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mb-6 font-semibold">
                      <MapPin size={14} className="text-indigo-400" /> {trip.country}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                        <Calendar size={18} className="text-indigo-500" /> {trip.days} Days
                      </div>
                      <div className="text-[10px] font-black px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg uppercase tracking-wider">
                        Ready
                      </div>
                    </div>
                  </div>
                </div>
            ))}

            {/* ADD NEW CARD */}
            <div
                onClick={() => navigate("/create-trip")}
                className="bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center group hover:bg-white/10 hover:border-indigo-400 transition-all cursor-pointer min-h-[400px]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-90 transition-all duration-500">
                <Plus size={40} />
              </div>
              <h4 className="text-white font-black mt-8 text-xl tracking-tight">Create New</h4>
            </div>
          </div>
        </main>
      </div>
  );
};

export default Dashboard;