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
  isOwnReport: boolean;
  userVote: 'support' | 'oppose' | null;
  hasVoted: boolean;
  canVote: boolean;
}

const CivicReportPage = () => {
  const [myReports, setMyReports] = useState<CivicReport[]>([]);
  const [otherReports, setOtherReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'MINE' | 'OTHERS'>('MINE');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
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

  const fetchMyReports = async () => {
    try {
      const { data } = await axios.get('/civic-report/my-reports');
      setMyReports(data);
    } catch (err) {
      console.error('Failed to fetch my reports:', err);
      setMessage('Failed to fetch your reports');
    }
  };

  const fetchOtherReports = async () => {
    try {
      const { data } = await axios.get('/civic-report/other-reports');
      setOtherReports(data);
    } catch (err) {
      console.error('Failed to fetch other reports:', err);
      setMessage('Failed to fetch other reports');
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMyReports(), fetchOtherReports()]);
    } catch (err) {
      console.error('Error fetching reports:', err);
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
    try {
      await axios.post(`/civic-report/${reportId}/${type}`);
      await fetchOtherReports(); // Refresh other reports to update vote status
      setMessage(`✅ Successfully ${type}ed the report!`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to ${type} the report`;
      setMessage(`❌ ${errorMessage}`);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (position) {
      formData.append('latitude', position.lat.toString());
      formData.append('longitude', position.lng.toString());
    }
    
    try {
      await axios.post('/civic-report', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      await fetchMyReports(); // Refresh my reports
      e.currentTarget.reset();
      setMessage('✅ Report submitted successfully!');
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to submit report';
      setMessage(`❌ ${errorMessage}`);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const renderReportCard = (report: CivicReport) => (
    <div key={report.id} className="bg-gray-700 p-4 rounded-lg text-white">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-green-400">{report.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          report.status === 'resolved' ? 'bg-green-600' :
          report.status === 'escalated' ? 'bg-red-600' :
          'bg-yellow-600'
        }`}>
          {report.status.toUpperCase()}
        </span>
      </div>
      
      <div className="mb-3">
        <span className="inline-block px-2 py-1 bg-gray-600 rounded text-xs mb-2">
          {report.type.replace('_', ' ').toUpperCase()}
        </span>
        <p className="text-gray-300">{report.description}</p>
      </div>

      {report.imageUrl && (
        <img 
          src={`http://localhost:3000${report.imageUrl}`} 
          alt={report.title} 
          className="w-full h-48 object-cover rounded mb-3" 
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-green-400">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {report.supportCount}
          </span>
          <span className="flex items-center text-red-400">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
            </svg>
            {report.oppositionCount}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(report.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Voting Section */}
      {report.isOwnReport ? (
        <div className="text-center py-2 bg-gray-800 rounded">
          <p className="text-gray-400 italic">📝 This is your report</p>
        </div>
      ) : report.hasVoted ? (
        <div className="text-center py-2 bg-gray-800 rounded">
          <p className="text-gray-400 italic">
            ✅ You {report.userVote === 'support' ? 'supported' : 'opposed'} this report
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => handleVote(report.id, 'support')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
          >
            👍 Support
          </button>
          <button
            onClick={() => handleVote(report.id, 'oppose')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
          >
            👎 Oppose
          </button>
        </div>
      )}
    </div>
  );

  const renderReports = (reports: CivicReport[]) => {
    if (loading) return <p className="text-white text-center">Loading reports...</p>;
    if (reports.length === 0) return <p className="text-white text-center">No reports found.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(renderReportCard)}
      </div>
    );
  };

  return (
    <RoleGuard role="CITIZEN">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-white">🏛️ Civic Reporting</h1>
        
        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            {message}
          </div>
        )}

        {/* Submit Report Form */}
        <div className="bg-gray-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-white mb-4">📍 Submit a Report</h2>
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <input 
              type="text" 
              name="title" 
              placeholder="Report Title" 
              required 
              className="w-full p-3 rounded bg-gray-800 text-white border border-gray-600 focus:border-green-500" 
            />
            <textarea 
              name="description" 
              placeholder="Describe the issue..." 
              required 
              rows={3}
              className="w-full p-3 rounded bg-gray-800 text-white border border-gray-600 focus:border-green-500" 
            />
            <select 
              name="type" 
              required 
              className="w-full p-3 rounded bg-gray-800 text-white border border-gray-600 focus:border-green-500"
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
            <input 
              type="file" 
              name="photo" 
              accept="image/*" 
              className="w-full p-3 rounded bg-gray-800 text-white border border-gray-600"
            />
            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded font-semibold transition-colors"
            >
              🚀 Submit Report
            </button>
          </form>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 rounded-lg shadow">
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'MINE' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('MINE')}
            >
              📝 My Reports ({myReports.length})
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'OTHERS' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('OTHERS')}
            >
              🌍 Other Reports ({otherReports.length})
            </button>
          </div>

          {/* View Mode Toggle for Other Reports */}
          {activeTab === 'OTHERS' && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-center space-x-2">
                <button
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    viewMode === 'LIST' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                  onClick={() => setViewMode('LIST')}
                >
                  📋 List View
                </button>
                <button
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    viewMode === 'MAP' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                  onClick={() => setViewMode('MAP')}
                >
                  🗺️ Map View
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {activeTab === 'MINE' ? (
              renderReports(myReports)
            ) : viewMode === 'LIST' ? (
              renderReports(otherReports)
            ) : (
              <div className="h-[600px] w-full rounded-lg overflow-hidden">
                <Map
                  reports={otherReports}
                  refreshReports={fetchOtherReports}
                  userPosition={position}
                  loggedInUserId={currentUserId}
                  onVote={handleVote}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default CivicReportPage;