import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsData, getAllYears } from '../utils/eventData';
import EventGallery from '../components/features/EventGallery';
import RatingManager from '../components/features/RatingManager';
import TagManager from '../components/features/TagManager';
import useRatingStore from '../stores/ratingStore';
import useTagStore from '../stores/tagStore';
import StarRating from '../components/features/StarRating';
import type { PropertyEvent } from '../types';

export default function EventParties() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<PropertyEvent | null>(null);
  const [showRatingManager, setShowRatingManager] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  
  const { getRatingStats } = useRatingStore();
  const { getTagStats } = useTagStore();
  
  const years = getAllYears();
  const properties = [
    { id: 'all', name: 'All Properties' },
    { id: 'archive', name: 'The Archive' },
    { id: 'lucille', name: 'Lucille' },
    { id: 'fred', name: 'The Fred' },
  ];
  
  // Filter events based on selection
  const currentYearData = eventsData.find(y => y.year === selectedYear);
  const filteredEvents = currentYearData?.events.filter(event => 
    selectedProperty === 'all' || event.propertyId === selectedProperty
  ) || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-charcoal mb-4">Event Parties</h1>
        <p className="text-lg text-gray-600">
          Celebrating community at Solhem properties. Browse our gallery of memorable events and gatherings.
        </p>
      </div>
      
      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between mb-8">
        <div className="flex flex-wrap gap-4">
        {/* Year Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {/* Property Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Property:</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>{prop.name}</option>
            ))}
          </select>
        </div>
        </div>
        
        {/* Manager Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/gallery')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Gallery
          </button>
          
          <button
            onClick={() => setShowRatingManager(!showRatingManager)}
            className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Rating Manager
          </button>
          
          <button
            onClick={() => setShowTagManager(!showTagManager)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Tag Manager
          </button>
        </div>
      </div>
      
      {/* Rating Manager Panel */}
      {showRatingManager && (
        <div className="mb-8">
          <RatingManager 
            eventId={selectedProperty === 'all' ? undefined : filteredEvents[0]?.id}
            onClose={() => setShowRatingManager(false)}
          />
        </div>
      )}
      
      {/* Tag Manager Panel */}
      {showTagManager && (
        <div className="mb-8">
          <TagManager 
            eventId={selectedProperty === 'all' ? undefined : filteredEvents[0]?.id}
            onClose={() => setShowTagManager(false)}
          />
        </div>
      )}
      
      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found for the selected criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              {/* Event Cover Image */}
              <div className="h-48 overflow-hidden">
                <img
                  src={event.coverPhoto}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Event Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    {event.propertyName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {event.attendees} attendees
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.photos.length} photos
                  </div>
                </div>
                
                {/* Stats Section */}
                <div className="space-y-2">
                  {/* Rating Stats */}
                  {(() => {
                    const ratingStats = getRatingStats(event.id);
                    return ratingStats.totalRatings > 0 ? (
                      <div className="flex items-center gap-2">
                        <StarRating rating={ratingStats.averageRating} readonly size="sm" />
                        <span className="text-sm text-gray-600">
                          {ratingStats.averageRating.toFixed(1)} ({ratingStats.totalRatings} ratings)
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">No ratings yet</div>
                    );
                  })()}
                  
                  {/* Tag Stats */}
                  {(() => {
                    const tagStats = getTagStats(event.id);
                    return tagStats.totalTaggedPhotos > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tagStats.popularTags.slice(0, 3).map(({ tag }) => (
                          <span 
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {tagStats.popularTags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{tagStats.popularTags.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Event Gallery Modal */}
      {selectedEvent && (
        <EventGallery
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}