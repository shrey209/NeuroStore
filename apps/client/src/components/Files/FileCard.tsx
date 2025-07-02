import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Database,
  Palette,
  FileSpreadsheet,
  File,
  Hash,
  Calendar,
  HardDrive,
  Plus,
  Users,
  Lock,
  Globe,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  History,
  Edit3,
  Eye
} from 'lucide-react';
import { FileItem } from '../../types';
import { formatFileSize, formatDate } from '../../utils/fileUtils';

interface FileCardProps {
  file: FileItem;
  onFileClick: (file: FileItem) => void;
  onAddTag?: (fileId: string, tag: string) => void;
  onManageAccess?: (fileId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onRenameFile?: (fileId: string, newName: string) => void;
  onViewVersions?: (fileId: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({ 
  file, 
  onFileClick, 
  onAddTag, 
  onManageAccess,
  onDeleteFile,
  onRenameFile,
  onViewVersions
}) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState(file.filename);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const getAccessIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'public':
        return <Globe className="w-3 h-3 text-green-500" />;
      case 'shared':
        return <Users className="w-3 h-3 text-blue-500" />;
      case 'private':
      default:
        return <Lock className="w-3 h-3 text-gray-500" />;
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newTag.trim() && onAddTag) {
      onAddTag(file.id, newTag.trim());
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleManageAccess = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onManageAccess) {
      onManageAccess(file.id);
    }
  };

  const handleDropdownAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    
    switch (action) {
      case 'delete':
        if (onDeleteFile && confirm(`Are you sure you want to delete "${file.filename}"?`)) {
          onDeleteFile(file.id);
        }
        break;
      case 'rename':
        setIsRenaming(true);
        setNewFileName(file.filename);
        break;
      case 'versions':
        if (onViewVersions) {
          onViewVersions(file.id);
        }
        break;
      case 'preview':
        onFileClick(file);
        break;
    }
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newFileName.trim() && newFileName !== file.filename && onRenameFile) {
      onRenameFile(file.id, newFileName.trim());
    }
    setIsRenaming(false);
  };

  const displayTags = showAllTags ? file.tags : file.tags.slice(0, 2);
  const hasMoreTags = file.tags.length > 2;

  return (
    <div
      onClick={() => onFileClick(file)}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group relative"
    >
      {/* Header: Icon, Title, Access, and Menu */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {getFileIcon(file.type)}
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <form onSubmit={handleRename} className="mb-1">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={() => setIsRenaming(false)}
                  className="w-full text-sm font-semibold text-gray-900 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </form>
            ) : (
              <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200 mb-1">
                {file.filename}
              </h3>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(file.type)}`}>
              {file.type.toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Actions: Access Level and Menu */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Access Level Indicator */}
          <button
            onClick={handleManageAccess}
            className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
            title="Manage Access"
          >
            {getAccessIcon(file.accessLevel || 'private')}
            <span className="text-xs text-gray-500 capitalize">{file.accessLevel || 'private'}</span>
          </button>

          {/* Three-dot Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              title="More options"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={(e) => handleDropdownAction('preview', e)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={(e) => handleDropdownAction('rename', e)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={(e) => handleDropdownAction('versions', e)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <History className="w-4 h-4" />
                    <span>View Versions</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={(e) => handleDropdownAction('delete', e)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags Section - Compact Layout */}
      {(file.tags.length > 0 || showTagInput) && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tags</span>
            {hasMoreTags && !showAllTags && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllTags(true);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                +{file.tags.length - 2} more
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {displayTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
              >
                {tag}
              </span>
            ))}
            
            {showAllTags && hasMoreTags && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllTags(false);
                }}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
            )}
            
            {/* Add Tag Button/Input */}
            {showTagInput ? (
              <form onSubmit={handleAddTag} className="inline-flex">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onBlur={() => {
                    if (!newTag.trim()) setShowTagInput(false);
                  }}
                  placeholder="Add tag..."
                  className="w-20 px-2 py-0.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </form>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTagInput(true);
                }}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </button>
            )}
          </div>
        </div>
      )}

      {/* File Details - Bottom */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <HardDrive className="w-3 h-3" />
          <span>{formatFileSize(file.size)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(file.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default FileCard;