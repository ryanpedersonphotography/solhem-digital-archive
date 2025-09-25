import { Link } from 'react-router-dom';

interface PropertyCardProps {
  id: string;
  name: string;
  address: string;
  units: number;
  occupancy: number;
  image?: string;
}

export default function PropertyCard({ id, name, address, units, occupancy, image }: PropertyCardProps) {
  return (
    <Link to={`/property/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
          {image ? (
            <img src={image} alt={name} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-600 mb-3">{address}</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              <strong className="text-gray-700">{units}</strong> units
            </span>
            <span className="text-gray-500">
              <strong className="text-gray-700">{occupancy}%</strong> occupied
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}