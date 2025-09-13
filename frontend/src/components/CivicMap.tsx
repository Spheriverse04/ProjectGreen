'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CivicReport {
  id: string;
  title: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  supportCount: number;
  oppositionCount: number;
  status: 'pending' | 'escalated' | 'resolved';
  createdAt: string;
  createdById?: string;
  isOwnReport: boolean;
  userVote: 'support' | 'oppose' | null;
  hasVoted: boolean;
  canVote: boolean;
}

interface CivicMapProps {
  reports: CivicReport[];
  refreshReports: () => void;
  userPosition?: { lat: number; lng: number } | null;
  loggedInUserId: string | null;
  onVote: (reportId: string, type: 'support' | 'oppose') => Promise<void>;
}

// Dynamically import MapContainer and related components
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

const CivicMap: React.FC<CivicMapProps> = ({
  reports,
  userPosition,
  onVote,
}) => {
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});

  const handleVote = async (reportId: string, type: 'support' | 'oppose') => {
    setVotingStates(prev => ({ ...prev, [reportId]: true }));
    try {
      await onVote(reportId, type);
    } finally {
      setVotingStates(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const getStatusIcon = (status: string) => {
    const color = status === 'resolved' ? 'green' : status === 'escalated' ? 'red' : 'orange';
    return L.icon({
      iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${color}`,
      iconSize: [30, 50],
      iconAnchor: [15, 50],
      popupAnchor: [0, -45],
    });
  };

  const userIcon = L.icon({
    iconUrl: 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=U|blue',
    iconSize: [30, 50],
    iconAnchor: [15, 50],
    popupAnchor: [0, -45],
  });

  if (typeof window === 'undefined') return null;

  return (
    <MapContainer
      center={userPosition ? [userPosition.lat, userPosition.lng] : [20.5937, 78.9629]}
      zoom={userPosition ? 13 : 5}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <strong>📍 Your Location</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {reports.map(report => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={getStatusIcon(report.status)}
        >
          <Popup maxWidth={300} minWidth={250}>
            <div className="space-y-3 p-2">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{report.title}</h3>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${
                  report.status === 'resolved' ? 'bg-green-600' :
                  report.status === 'escalated' ? 'bg-red-600' :
                  'bg-yellow-600'
                }`}>
                  {report.status.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="inline-block px-2 py-1 bg-gray-200 rounded text-xs mb-2">
                  {report.type.replace('_', ' ').toUpperCase()}
                </span>
                <p className="text-gray-700 text-sm">{report.description}</p>
              </div>

              {report.imageUrl && (
                <img
                  src={`http://localhost:3000${report.imageUrl}`}
                  alt={report.title}
                  className="w-full h-32 object-cover rounded"
                />
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    {report.supportCount}
                  </span>
                  <span className="flex items-center text-red-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                    {report.oppositionCount}
                  </span>
                </div>
                <span className="text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Voting Section */}
              {report.isOwnReport ? (
                <div className="text-center py-2 bg-gray-100 rounded">
                  <p className="text-gray-600 italic text-sm">📝 This is your report</p>
                </div>
              ) : report.hasVoted ? (
                <div className="text-center py-2 bg-gray-100 rounded">
                  <p className="text-gray-600 italic text-sm">
                    ✅ You {report.userVote === 'support' ? 'supported' : 'opposed'} this report
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote(report.id, 'support')}
                    disabled={votingStates[report.id]}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    {votingStates[report.id] ? '...' : '👍 Support'}
                  </button>
                  <button
                    onClick={() => handleVote(report.id, 'oppose')}
                    disabled={votingStates[report.id]}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    {votingStates[report.id] ? '...' : '👎 Oppose'}
                  </button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default CivicMap;