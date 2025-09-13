'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';
import 'leaflet/dist/leaflet.css';

const Map = dynamic(() => import('@/components/CivicMap'), { ssr: false });

export interface CivicReport {
  id: string;
  title: string;
  description: string;
  type: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  supportCount: number;
  oppositionCount: number;
  status: 'pending' | 'escalated' | 'resolved';
  createdAt: string;
  createdById: string;
  createdBy?: { id: string; name: string; role: string };
  supports?: { userId: string; support: boolean }[];
}

const CivicReportPage = () => {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'MINE' | 'OTHERS'>('MINE');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get actual user ID from token
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await axios.post('/auth/check', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUserId(response.data.user.userId);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/civic-report');
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setPosition({ lat: 28.6139, lng: 77.2090 })
      );
    }
    fetchReports();
  }, []);

  const handleVote = async (reportId: string, type: 'support' | 'oppose') => {
    const report = reports.find(r => r.id === reportId);
    if (report?.createdById === currentUserId) {
      setMessage('❌ You cannot vote on your own report.');
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    const hasVoted = report?.supports?.some(s => s.userId === currentUserId);
    if (hasVoted) {
      setMessage(`❌ Already ${type}ed this report.`);
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    try {
      await axios.post(`/civic-report/${reportId}/${type}`);
      fetchReports();
    } catch (err) {
      console.error(err);
      setMessage(`❌ Failed to ${type} the report.`);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const renderReports = (list: CivicReport[]) => {
    if (loading) return <p className="text-white">Loading reports...</p>;
    if (list.length === 0) return <p className="text-white">No reports found.</p>;

    return (
      <ul className="space-y-3">
        {list.map(r => {
          const isOwnReport = r.createdById === currentUserId;
          const hasVoted = r.supports?.some(s => s.userId === currentUserId);
          return (
            <li key={r.id} className="bg-gray-700 p-3 rounded text-white">
              <strong>{r.title}</strong> ({r.type.replace('_', ' ')})<br />
              {r.description}<br />
              {r.imageUrl && (
                <img src={r.imageUrl} alt={r.title} className="mt-2 rounded max-h-60 w-full object-cover" />
              )}
              Status:{' '}
              <span className={
                r.status === 'resolved' ? 'text-green-400' :
                r.status === 'escalated' ? 'text-red-400' :
                'text-yellow-400'
              }>
                {r.status}
              </span><br />
              👍 {r.supportCount} | 👎 {r.oppositionCount}<br />

              {isOwnReport ? (
                <p className="mt-2 text-gray-400 italic">This is your report</p>
              ) : hasVoted ? (
                <p className="mt-2 text-gray-400 italic">✔ You have already voted</p>
              ) : (
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white"
                    onClick={() => handleVote(r.id, 'support')}
                  >
                    Support
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white"
                    onClick={() => handleVote(r.id, 'oppose')}
                  >
                    Oppose
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const myReports = reports.filter(r => r.createdById === currentUserId);
  const otherReports = reports.filter(r => r.createdById !== currentUserId);

  return (
    <RoleGuard role="CITIZEN">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-white">🏛️ Civic Reporting</h1>
        {message && <div className="p-2 bg-green-600 text-white rounded">{message}</div>}

        <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg">
          <Map
            reports={reports}
            refreshReports={fetchReports}
            userPosition={position}
            loggedInUserId={currentUserId}
          />
        </div>

        <div className="bg-gray-900 p-4 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-white">📍 Submit a Report</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (position) {
                formData.append('latitude', position.lat.toString());
                formData.append('longitude', position.lng.toString());
              }
              try {
                await axios.post('/civic-report', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                await fetchReports();
                e.currentTarget.reset();
                setMessage('✅ Report submitted successfully!');
                setTimeout(() => setMessage(null), 5000);
                setActiveTab('MINE'); // switch to My Reports
              } catch {
                setMessage('❌ Failed to submit report.');
                setTimeout(() => setMessage(null), 5000);
              }
            }}
            className="space-y-3"
          >
            <input type="text" name="title" placeholder="Title" required className="w-full p-2 rounded bg-gray-800 text-white" />
            <textarea name="description" placeholder="Describe the issue..." required className="w-full p-2 rounded bg-gray-800 text-white" />
            <select name="type" required className="w-full p-2 rounded bg-gray-800 text-white">
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
            <input type="file" name="photo" accept="image/*" />
            <button type="submit" className="bg-green-600 px-4 py-2 rounded text-white w-full">🚀 Submit Report</button>
          </form>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded ${activeTab === 'MINE' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setActiveTab('MINE')}
            >
              My Reports
            </button>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'OTHERS' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setActiveTab('OTHERS')}
            >
              Other Reports
            </button>
          </div>
          {activeTab === 'MINE' ? renderReports(myReports) : renderReports(otherReports)}
        </div>
      </div>
    </RoleGuard>
  );
};

export default CivicReportPage;

