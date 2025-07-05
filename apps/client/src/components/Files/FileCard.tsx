import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Image,
  Video,
  FileSpreadsheet,
  Palette,
  Database,
  File,
  MoreVertical,

  Trash2,
  Clock,
  Share2,
  Globe,
  Lock,
  Users,
  Plus,
  X,
  UserPlus,
  Link,
  Copy,
  Save
} from 'lucide-react';
import { SharedFile, SharedAccessEntry } from  '@neurostore/shared/types';

interface FileCardProps {
  file: SharedFile;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [showAccessManagement, setShowAccessManagement] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  // Local state for access management changes
  const [localIsPublic, setLocalIsPublic] = useState(file.is_public);
  const [localSharedWith, setLocalSharedWith] = useState<SharedAccessEntry[]>([...file.shared_with]);
  const [newUserAccess, setNewUserAccess] = useState('');
  const [newAccessType, setNewAccessType] = useState<'gmail' | 'github_id'>('gmail');
  const [newAccessLevel, setNewAccessLevel] = useState<'read' | 'write'>('read');
  const [publicLink, setPublicLink] = useState('');

  const getFileType = (extension: string): string => {
    switch (extension.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
        return 'image';
      case 'mp4':
      case 'mkv':
      case 'mov':
      case 'avi':
      case 'webm':
        return 'video';
      case 'pdf':
        return 'pdf';
      case 'ppt':
      case 'pptx':
        return 'presentation';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'spreadsheet';
      case 'psd':
      case 'fig':
      case 'sketch':
      case 'xd':
        return 'design';
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
        return 'document';
      case 'sql':
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
      case 'db':
      case 'mdb':
        return 'data';
      default:
        return 'other';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'image':
        return <Image className="w-8 h-8 text-green-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      case 'presentation':
        return <FileText className="w-8 h-8 text-orange-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      case 'design':
        return <Palette className="w-8 h-8 text-pink-500" />;
      case 'document':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'data':
        return <Database className="w-8 h-8 text-indigo-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'image':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'video':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'presentation':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'spreadsheet':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'design':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'document':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'data':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAccessLevel = () => {
    if (file.is_public) return 'Public';
    if (file.shared_with.length > 0) return 'Shared';
    return 'Private';
  };

  const getAccessLevelIcon = () => {
    if (file.is_public) return <Globe className="w-4 h-4" />;
    if (file.shared_with.length > 0) return <Users className="w-4 h-4" />;
    return <Lock className="w-4 h-4" />;
  };

  const getAccessLevelColor = () => {
    if (file.is_public) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (file.shared_with.length > 0) return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const fileType = getFileType(file.file_extension || '');
 const displayTags = (file.tags ?? []).slice(0, 3);


  const handleCardClick = () => {
    navigate(`/preview/${file.file_id}`);
  };

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleAddTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAddTag(!showAddTag);
  };

  const handleAccessManagementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAccessManagement(!showAccessManagement);
    setShowActions(false);
    
    // Reset local state to current file state
    setLocalIsPublic(file.is_public);
    setLocalSharedWith([...file.shared_with]);
    
    // Generate public link if file is public
    if (file.is_public) {
      setPublicLink(`https://yourapp.com/public/${file.file_id}`);
    } else {
      setPublicLink('');
    }
  };

  // TODO: Implement delete functionality
  const handleDelete = () => {
    console.log('Delete file:', file.file_id);
    // Add delete logic here
    setShowActions(false);
  };

  // TODO: Implement view version history functionality
  const handleViewVersionHistory = () => {
    console.log('View version history for:', file.file_id);
    // Add version history logic here
    setShowActions(false);
  };

  // TODO: Implement add tag functionality
  const handleAddTag = () => {
    if (newTag.trim()) {
      console.log('Add tag:', newTag, 'to file:', file.file_id);
      // TODO: Add API call to add tag to file
      setNewTag('');
      setShowAddTag(false);
    }
  };

  // Local toggle for public/private (doesn't save until Save button is clicked)
  const handleTogglePublic = () => {
    const newPublicState = !localIsPublic;
    setLocalIsPublic(newPublicState);
    
    // Generate or clear public link based on new state
    if (newPublicState) {
      setPublicLink(`https://yourapp.com/public/${file.file_id}`);
    } else {
      setPublicLink('');
    }
  };

  // Local add user access (doesn't save until Save button is clicked)
  const handleAddUserAccess = () => {
    if (newUserAccess.trim()) {
      const accessEntry: SharedAccessEntry = {
        [newAccessType]: newUserAccess,
        access_level: newAccessLevel
      };
      
      setLocalSharedWith([...localSharedWith, accessEntry]);
      setNewUserAccess('');
      setNewAccessLevel('read');
    }
  };

  // Local remove user access (doesn't save until Save button is clicked)
  const handleRemoveUserAccess = (index: number) => {
    const updatedSharedWith = localSharedWith.filter((_, i) => i !== index);
    setLocalSharedWith(updatedSharedWith);
  };

  // TODO: Implement save access changes functionality
  const handleSaveAccessChanges = () => {
    const accessData = {
      file_id: file.file_id,
      is_public: localIsPublic,
      shared_with: localSharedWith
    };
    
    console.log('Save access changes:', accessData);
    // TODO: Add API call to save access changes to backend
    // After successful save, update the original file data and close modal
    setShowAccessManagement(false);
  };

  // TODO: Implement copy link functionality
  const handleCopyLink = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      console.log('Public link copied:', publicLink);
      // TODO: Show success toast/notification
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return localIsPublic !== file.is_public || 
           JSON.stringify(localSharedWith) !== JSON.stringify(file.shared_with);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUserDisplayName = (accessEntry: SharedAccessEntry) => {
    if (accessEntry.user_id) return `User: ${accessEntry.user_id}`;
    if (accessEntry.gmail) return `Gmail: ${accessEntry.gmail}`;
    if (accessEntry.github_id) return `GitHub: ${accessEntry.github_id}`;
    return 'Unknown User';
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group relative"
      onClick={handleCardClick}
    >
      {/* Header with File Icon, Type, and Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getFileIcon(fileType)}
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(fileType)}`}>
            {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
          </span>
        </div>
        
        {/* Actions Menu - Always visible */}
        <div className="flex items-center space-x-2">
          {/* Access Level Badge */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getAccessLevelColor()}`}>
            {getAccessLevelIcon()}
            <span>{getAccessLevel()}</span>
          </div>
          
          {/* Three Dots Menu - Always visible */}
          <div className="relative">
            <button
              onClick={handleActionsClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <button
                  onClick={handleAccessManagementClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Share2 className="w-4 h-4 mr-3" />
                  Manage Access
                </button>
                <button
                  onClick={handleViewVersionHistory}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Clock className="w-4 h-4 mr-3" />
                  View Version History
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete
                </button>
                {/* TODO: Add more action options here as needed */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Access Management Modal */}
      {showAccessManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAccessManagement(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Access</h3>
              <button
                onClick={() => setShowAccessManagement(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Public/Private Toggle */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900">Public Access</span>
                </div>
                <button
                  onClick={handleTogglePublic}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    localIsPublic ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      localIsPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {localIsPublic ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    This file will be public. Anyone with the link can view it (read-only access).
                  </p>
                  {publicLink && (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Link className="w-4 h-4 text-blue-500" />
                      <input
                        type="text"
                        value={publicLink}
                        readOnly
                        className="flex-1 text-sm bg-transparent border-none outline-none text-blue-700 font-medium"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-blue-500 hover:text-blue-700"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Toggle to make this file public and generate a shareable link with read-only access.
                </p>
              )}
            </div>

            {/* Current Users with Access - Scrollable */}
            {localSharedWith.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Users with Access</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {localSharedWith.length} user{localSharedWith.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Scrollable container - max height for 2 users, then scroll */}
                <div className={`space-y-2 ${localSharedWith.length > 2 ? 'max-h-32 overflow-y-auto pr-2' : ''}`}>
                  {localSharedWith.map((access, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm text-gray-700 font-medium truncate">
                            {getUserDisplayName(access)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium w-fit ${
                            access.access_level === 'write' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {access.access_level} access
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveUserAccess(index)}
                        className="p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors duration-200 flex-shrink-0 ml-2"
                        title="Remove access"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Scroll indicator for many users */}
                {localSharedWith.length > 2 && (
                  <div className="text-xs text-gray-400 text-center mt-2 italic">
                    Scroll to see all users
                  </div>
                )}
              </div>
            )}

            {/* Add New User */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add User Access</h4>
              <div className="space-y-3">
                {/* User Type Selection */}
                <div className="flex items-center space-x-3">
                  <select
                    value={newAccessType}
                    onChange={(e) => setNewAccessType(e.target.value as 'gmail' | 'github_id')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="gmail">Gmail</option>
                    <option value="github_id">GitHub Username</option>
                  </select>
                  <input
                    type="text"
                    value={newUserAccess}
                    onChange={(e) => setNewUserAccess(e.target.value)}
                    placeholder={newAccessType === 'gmail' ? 'Enter email address...' : 'Enter GitHub username...'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                {/* Access Level and Add Button */}
                <div className="flex items-center space-x-3">
                  <select
                    value={newAccessLevel}
                    onChange={(e) => setNewAccessLevel(e.target.value as 'read' | 'write')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="read">Read Access</option>
                    <option value="write">Write Access</option>
                  </select>
                  <button
                    onClick={handleAddUserAccess}
                    disabled={!newUserAccess.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center space-x-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {hasUnsavedChanges() && (
                  <span className="text-orange-600 font-medium">• Unsaved changes</span>
                )}
              </div>
              <button
                onClick={handleSaveAccessChanges}
                disabled={!hasUnsavedChanges()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center space-x-2 font-medium"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mt-4">
              <p className="mb-1"><strong>Public:</strong> Anyone with the link can view (read-only)</p>
              <p className="mb-1"><strong>Shared:</strong> Specific users with defined permissions</p>
              <p><strong>Private:</strong> Only you can access this file</p>
            </div>
          </div>
        </div>
      )}

      {/* File Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors duration-200">
        {file.file_name}
      </h3>

      {/* File Size */}
      {file.file_size && (
        <p className="text-sm text-gray-500 mb-3">
          {formatFileSize(file.file_size)}
        </p>
      )}

      {/* Tags Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Tags</span>
          <button
            onClick={handleAddTagClick}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-gray-600"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        
        {/* Display Tags */}
        {  displayTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {   (file.tags ?? []).length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                +{(file.tags ?? []).length - 3} more
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">No tags</div>
        )}

        {/* Add Tag Input */}
        {showAddTag && (
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={handleAddTag}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Upload Date */}
      <p className="text-xs text-gray-400">
        Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
      </p>
    </div>
  );
};

export default FileCard;