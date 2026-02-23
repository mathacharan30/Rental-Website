// src/pages/Main/CustomerProfile.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CustomerProfile = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  if (!userProfile) return null;

  const { name, email, phone, address, role, uid } = userProfile;

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Profile</h2>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            {role}
          </span>
        </div>

        <div className="space-y-0">
          <Row label="Name"    value={name} />
          <Row label="Email"   value={email} />
          <Row label="Phone"   value={phone} />
          <Row label="Address" value={address} />
          <Row label="UID"     value={uid} />
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full border border-red-300 text-red-600 py-2 rounded hover:bg-red-50 transition-colors text-sm"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default CustomerProfile;
