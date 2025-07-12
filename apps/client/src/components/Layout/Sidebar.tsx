import React, { useEffect, useState } from 'react';
import { 
  Home, 
  FolderOpen, 
  Upload, 
  Settings, 
  User, 
  HelpCircle, 
  LogOut,
  Database,
  Star,
  HardDrive
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User as SharedUser } from "@neurostore/shared/types";

import { BASE_URL } from '../../utils/fileUtils';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<SharedUser | null>(null); 
 const getInitials = (name: string) =>
  name?.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);

 useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/get`, {
          withCredentials: true,
        });
        setUser(res.data); 
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: FolderOpen, label: 'My Files', path: '/files' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: Star, label: 'Shared With', path: '/Shared-With' },
  ];

  const settingsItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });

    if (response.status === 200) {
      navigate('/');
    } else {
      console.error('Logout failed with status:', response.status);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};



  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">NeuroStore</h1>
            <p className="text-sm text-gray-500">Storage Service</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-8">
        {/* Main Menu */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Main Menu
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${
                    isActive(item.path) ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </h3>
          <nav className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${
                    isActive(item.path) ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Storage Used</span>
            <HardDrive className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">47.2 GB of 100 GB</span>
              <span className="text-gray-500">47%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '47%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
        {user?.profile_picture ? (
  <div className="w-10 h-10 rounded-full overflow-hidden">
    <img
      src={user.profile_picture}
      alt="User Profile"
      className="w-full h-full object-cover"
    />
  </div>
) : (
  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
    <span className="text-white font-semibold text-sm">
      {getInitials(user?.user_name || "")}
    </span>
  </div>
)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.user_name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.gmail}</p>
          </div>
        </div>
        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-3 text-gray-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;