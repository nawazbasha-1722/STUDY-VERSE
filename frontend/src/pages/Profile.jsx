import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>
      <div className="bg-[#0f1424] border border-white/5 p-6 rounded-3xl space-y-4">
        <div>
          <label className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Name</label>
          <span className="text-white text-lg font-medium">{user?.name}</span>
        </div>
        <div>
          <label className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Email</label>
          <span className="text-white text-lg font-medium">{user?.email}</span>
        </div>
        <div>
          <label className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Role</label>
          <span className="text-white capitalize text-lg font-medium">{user?.role}</span>
        </div>
      </div>
    </div>
  );
}
