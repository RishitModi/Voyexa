import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateRequiringLogin } from '@/utils/auth';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const TrendingDestinationsByMonth = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Month labels for display
  const monthLabels = {
    JANUARY: 'January - Winter Explorer',
    FEBRUARY: 'February - Romantic Getaway',
    MARCH: 'March - Spring Adventure',
    APRIL: 'April - Cherry Blossom Season',
    MAY: 'May - Spring Wanderlust',
    JUNE: 'June - Summer Starts',
    JULY: 'July - Peak Season',
    AUGUST: 'August - Festival Time',
    SEPTEMBER: 'September - Budget Traveler',
    OCTOBER: 'October - Fall Beauty',
    NOVEMBER: 'November - Thanksgiving Travel',
    DECEMBER: 'December - Holiday Magic'
  };

  // Load available months on mount
  useEffect(() => {
    // All 12 months in order
    const allMonths = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                       'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

    const fetchMonths = async () => {
      try {
        const res = await fetch(`${API}/api/dashboard/trending-months`);
        if (res.ok) {
          const data = await res.json();
          // Use all months, regardless of what's in DB
          // Missing months will be generated on-demand
          setMonths(allMonths);
          setSelectedMonth('MAY'); // Start with current month
        }
      } catch (err) {
        console.error('Failed to load months:', err);
        // Fallback: show all 12 months anyway
        setMonths(allMonths);
        setSelectedMonth('MAY');
      }
    };

    if (isOpen) {
      fetchMonths();
    }
  }, [isOpen]);

  // Load destinations when selected month changes
  useEffect(() => {
    if (!selectedMonth) return;

    const fetchDestinations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/api/dashboard/trending-by-month?month=${selectedMonth}`);
        if (res.ok) {
          const data = await res.json();
          setDestinations(data);
        } else {
          setError('Failed to load destinations');
        }
      } catch (err) {
        console.error('Failed to fetch destinations:', err);
        setError('Error loading destinations');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [selectedMonth]);

  if (!isOpen) return null;

  const currentMonthIndex = months.indexOf(selectedMonth);
  const canGoBack = currentMonthIndex > 0;
  const canGoForward = currentMonthIndex < months.length - 1;

  const handlePrevMonth = () => {
    if (canGoBack) {
      setSelectedMonth(months[currentMonthIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (canGoForward) {
      setSelectedMonth(months[currentMonthIndex + 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#020617] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-[#020617] border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Explore by Month</h2>
            <p className="text-white/60 text-sm mt-1">Discover trending destinations for each season</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Month Selector */}
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoBack}
              className="p-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="text-center flex-1 mx-4">
              <h3 className="text-xl font-bold text-white">
                {selectedMonth ? monthLabels[selectedMonth] : 'Loading...'}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoForward}
              className="p-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
              aria-label="Next month"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

           {/* Destinations Grid */}
           {loading ? (
             <div className="flex flex-col items-center justify-center py-12">
               <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
               <p className="text-white/60 text-sm">Gathering info for {selectedMonth ? monthLabels[selectedMonth]?.split(' - ')[0] : 'destinations'}...</p>
             </div>
           ) : error ? (
             <div className="text-center text-red-400 py-8">{error}</div>
           ) : destinations.length === 0 ? (
             <div className="text-center text-white/60 py-8">No destinations available for this month</div>
           ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {destinations.map((destination, idx) => (
                <button
                  key={`${destination.city}-${destination.country}-${idx}`}
                  type="button"
                  onClick={() =>
                    navigateRequiringLogin(navigate, '/create-trip', {
                      prefilledDestination: `${destination.city}, ${destination.country}`
                    })
                  }
                  className="group relative h-32 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
                >
                  {destination.imageUrl && (
                    <img
                      src={destination.imageUrl}
                      alt={`${destination.city}, ${destination.country}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-white text-sm">{destination.city}</div>
                      <div className="text-white/60 text-xs">{destination.country}</div>
                    </div>
                    <div className="text-left">
                      {destination.description && (
                        <p className="text-white/80 text-xs line-clamp-2 mb-2">{destination.description}</p>
                      )}
                      {destination.budget && (
                        <div className="text-indigo-400 text-xs font-semibold">
                          From ${destination.budget}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingDestinationsByMonth;

