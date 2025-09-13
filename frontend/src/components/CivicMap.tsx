'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import axios from '@/utils/axiosInstance';
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
  supports?: { userId: string; support: boolean }[];
}

interface CivicMapProps {
  reports: CivicReport[];
  refreshReports: () => void;
  userPosition?: { lat: number; lng: number } | null;
  loggedInUserId: string;
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
const useMapEvents = dynamic(
  () => import('react-leaflet').then(mod => mod.useMapEvents),
  { ssr: false }
);

const CivicMap: React.FC<CivicMapProps> = ({
  reports,
  refreshReports,
  userPosition,
  loggedInUserId,
}) => {
  const [newReport, setNewReport] = useState<Partial<CivicReport> & { imageFile?: File }>({});
  const [addingReport, setAddingReport] = useState(false);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setNewReport({ ...newReport, latitude: e.latlng.lat, longitude: e.latlng.lng });
        setAddingReport(true);
      },
    });
    return null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setNewReport({ ...newReport, [e.target.name]: e.target.value });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setNewReport({ ...newReport, imageFile: e.target.files[0] });
  };

  const handleSubmit = async () => {
    if (!newReport.title || !newReport.type || !newReport.latitude || !newReport.longitude) return;

    const formData = new FormData();
    formData.append('title', newReport.title!);
    formData.append('description', newReport.description || '');
    formData.append('type', newReport.type!);
    formData.append('latitude', newReport.latitude.toString());
    formData.append('longitude', newReport.longitude.toString());
    if (newReport.imageFile) formData.append('photo', newReport.imageFile);

    try {
      await axios.post('/civic-report', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAddingReport(false);
      setNewReport({});
      refreshReports();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (id: string, type: 'support' | 'oppose', report: CivicReport) => {
    if (report.createdById === loggedInUserId) return;
    if (report.supports?.some(s => s.userId === loggedInUserId)) return;

    try {
      await axios.post(`/civic-report/${id}/${type}`);
      refreshReports(); // refresh both map and page
    } catch (err) {
      console.error(err);
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
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Map_marker.svg',
    iconSize: [30, 50],
    iconAnchor: [15, 50],
    popupAnchor: [0, -45],
  });

  if (typeof window === 'undefined') return null;

  return (
    <div>
      <MapContainer
        center={userPosition ? [userPosition.lat, userPosition.lng] : [20.5937, 78.9629]}
        zoom={userPosition ? 13 : 5}
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />

        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
            <Popup>📍 You are here</Popup>
          </Marker>
        )}

        {reports.map(report => {
          const isOwnReport = report.createdById === loggedInUserId;
          const hasVoted = report.supports?.some(s => s.userId === loggedInUserId);

          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={getStatusIcon(report.status)}
            >
              <Popup>
                <div className="space-y-2">
                  <h3 className="font-bold">{report.title}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-gray-200">{report.type.replace('_', ' ')}</span>
                  <p>{report.description}</p>
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl.startsWith('/uploads/') ? report.imageUrl : `/uploads/${report.imageUrl}`}
                      alt={report.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <p className="text-sm">
                    <strong>Status:</strong>{' '}
                    <span
                      className={
                        report.status === 'resolved'
                          ? 'text-green-600'
                          : report.status === 'escalated'
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }
                    >
                      {report.status}
                    </span>
                  </p>
                  <p className="text-sm">👍 {report.supportCount} | 👎 {report.oppositionCount}</p>

                  {isOwnReport ? (
                    <p className="mt-2 text-gray-400 italic">This is your report</p>
                  ) : hasVoted ? (
                    <p className="mt-2 text-gray-400 italic">✔ Already voted</p>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleVote(report.id, 'support', report)}
                        className="px-2 py-1 rounded bg-green-500 text-white"
                      >
                        Support
                      </button>
                      <button
                        onClick={() => handleVote(report.id, 'oppose', report)}
                        className="px-2 py-1 rounded bg-red-500 text-white"
                      >
                        Oppose
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {addingReport && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="font-bold mb-2">➕ Add New Report</h3>
          <input
            type="text"
            name="title"
            placeholder="Issue Title"
            className="border p-2 w-full mb-2"
            onChange={handleInputChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            className="border p-2 w-full mb-2"
            onChange={handleInputChange}
          />
          <select
            name="type"
            className="border p-2 w-full mb-2"
            onChange={handleInputChange}
          >
            <option value="">Select Issue Type</option>
            <option value="illegal_dumping">Illegal Dumping</option>
            <option value="open_toilet">Open Toilet</option>
            <option value="dirty_toilet">Dirty Toilet</option>
            <option value="overflow_dustbin">Overflowing Dustbin</option>
            <option value="dead_animal">Dead Animal</option>
            <option value="fowl">Foul Smell</option>
            <option value="public_bin_request">Request for Public Bin</option>
            <option value="public_toilet_request">Request for Public Toilet</option>
          </select>
          <input type="file" onChange={handleFileChange} className="mb-2" />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit Report
          </button>
        </div>
      )}
    </div>
  );
};

export default CivicMap;

