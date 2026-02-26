import React, { useState } from 'react';
import { Search, Calendar, Clock } from 'lucide-react';
import { rideService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const SearchForm = () => {
  const { toast } = useToast();
  const [tripType, setTripType] = useState('oneway'); // 'oneway' or 'hourly'
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Connecter à l'API C# réelle
      const searchData = {
        ...formData,
        tripType,
      };
      
      // await rideService.searchRides(searchData);
      
      toast({
        title: 'Recherche en cours...',
        description: 'Nous recherchons les meilleurs conducteurs pour vous.',
      });
      
      console.log('Search data:', searchData);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la recherche',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
      {/* Trip Type Selector */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTripType('oneway')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            tripType === 'oneway'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          One way
        </button>
        <button
          onClick={() => setTripType('hourly')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            tripType === 'hourly'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Hourly Rental
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pick up */}
          <div className="relative">
            <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-2">
              Pick up
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="pickup"
                name="pickup"
                value={formData.pickup}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter pick up location"
              />
            </div>
          </div>

          {/* Drop off */}
          <div className="relative">
            <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700 mb-2">
              Drop off
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="dropoff"
                name="dropoff"
                value={formData.dropoff}
                onChange={handleChange}
                required={tripType === 'oneway'}
                disabled={tripType === 'hourly'}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={tripType === 'hourly' ? 'N/A for hourly rental' : 'Enter drop off location'}
              />
            </div>
          </div>

          {/* Date */}
          <div className="relative">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Time */}
          <div className="relative">
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Search size={20} />
          <span>{loading ? 'Searching...' : 'SEARCH'}</span>
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
