import React, { useState } from 'react';
import { X, Users, Globe, Lock, Plus, Trash2, Mail } from 'lucide-react';

interface AccessUser {
  id: string;
  email: string;
  name: string;
  permission: 'view' | 'edit' | 'admin';
  avatar?: string;
}

interface AccessManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  currentAccessLevel: 'private' | 'shared' | 'public';
  sharedUsers: AccessUser[];
  onUpdateAccess: (accessLevel: 'private' | 'shared' | 'public', users: AccessUser[]) => void;
}

const AccessManagementModal: React.FC<AccessManagementModalProps> = ({
  isOpen,
  onClose,
  fileName,
  currentAccessLevel,
  sharedUsers,
  onUpdateAccess
}) => {
  const [accessLevel, setAccessLevel] = useState(currentAccessLevel);
  const [users, setUsers] = useState<AccessUser[]>(sharedUsers);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  if (!isOpen) return null;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserEmail.trim()) {
      const newUser: AccessUser = {
        id: Date.now().toString(),
        email: newUserEmail.trim(),
        name: newUserEmail.split('@')[0],
        permission: 'view'
      };
      setUsers([...users, newUser]);
      setNewUserEmail('');
      setShowAddUser(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handlePermissionChange = (userId: string, permission: 'view' | 'edit' | 'admin') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, permission } : user
    ));
  };

  const handleSave = () => {
    onUpdateAccess(accessLevel, users);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Access</h2>
            <p className="text-sm text-gray-500 mt-1">{fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Access Level Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Access Level</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="accessLevel"
                  value="private"
                  checked={accessLevel === 'private'}
                  onChange={(e) => setAccessLevel(e.target.value as 'private')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Private</p>
                    <p className="text-xs text-gray-500">Only you can access this file</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="accessLevel"
                  value="shared"
                  checked={accessLevel === 'shared'}
                  onChange={(e) => setAccessLevel(e.target.value as 'shared')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Shared</p>
                    <p className="text-xs text-gray-500">Share with specific people</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="accessLevel"
                  value="public"
                  checked={accessLevel === 'public'}
                  onChange={(e) => setAccessLevel(e.target.value as 'public')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Public</p>
                    <p className="text-xs text-gray-500">Anyone with the link can access</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Shared Users Management */}
          {accessLevel === 'shared' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Shared with</h3>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>

              {/* Add User Form */}
              {showAddUser && (
                <form onSubmit={handleAddUser} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddUser(false);
                        setNewUserEmail('');
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Users List */}
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No users added yet</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.permission}
                          onChange={(e) => handlePermissionChange(user.id, e.target.value as 'view' | 'edit' | 'admin')}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="view">View</option>
                          <option value="edit">Edit</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessManagementModal;