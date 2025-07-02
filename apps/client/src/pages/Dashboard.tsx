import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import SearchBar from '../components/Search/SearchBar';
import FileList from '../components/Files/FileList';
import AccessManagementModal from '../components/Modals/AccessManagementModal';
import { mockFiles } from '../data/mockFiles';
import { FileItem, SearchFilters, PaginationInfo, AccessUser } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedFileForAccess, setSelectedFileForAccess] = useState<FileItem | null>(null);
  const itemsPerPage = 12;

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    searchType: 'normal',
    selectedTags: []
  });

  // Get all unique tags
  const availableTags = useMemo(() => {
    const allTags = files.flatMap(file => file.tags);
    return Array.from(new Set(allTags)).sort();
  }, [files]);

  // Filter files based on search criteria
  const filteredFiles = useMemo(() => {
    let filtered = [...files];

    // Apply query filter
    if (filters.query) {
      const query = filters.query.toLowerCase();
      switch (filters.searchType) {
        case 'normal':
          filtered = filtered.filter(file =>
            file.filename.toLowerCase().includes(query)
          );
          break;
        case 'semantic':
          // Simulate semantic search by searching in tags and filename
          filtered = filtered.filter(file =>
            file.filename.toLowerCase().includes(query) ||
            file.tags.some(tag => tag.toLowerCase().includes(query))
          );
          break;
        case 'tags':
          filtered = filtered.filter(file =>
            file.tags.some(tag => tag.toLowerCase().includes(query))
          );
          break;
      }
    }

    // Apply tag filters
    if (filters.selectedTags.length > 0) {
      filtered = filtered.filter(file =>
        filters.selectedTags.some(selectedTag =>
          file.tags.includes(selectedTag)
        )
      );
    }

    return filtered;
  }, [filters, files]);

  // Paginate results
  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFiles.slice(startIndex, endIndex);
  }, [filteredFiles, currentPage, itemsPerPage]);

  const pagination: PaginationInfo = {
    currentPage,
    totalPages: Math.ceil(filteredFiles.length / itemsPerPage),
    totalItems: filteredFiles.length,
    itemsPerPage
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFileClick = (file: FileItem) => {
    navigate(`/preview/${file.id}`);
  };

  const handleAddTag = (fileId: string, tag: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, tags: [...file.tags, tag] }
          : file
      )
    );
  };

  const handleManageAccess = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setSelectedFileForAccess(file);
      setAccessModalOpen(true);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId
          ? { ...file, filename: newName }
          : file
      )
    );
  };

  const handleViewVersions = (fileId: string) => {
    // Placeholder for version history functionality
    console.log('View versions for file:', fileId);
    // You can implement a modal or navigate to a versions page
  };

  const handleUpdateAccess = (accessLevel: 'private' | 'shared' | 'public', users: AccessUser[]) => {
    if (selectedFileForAccess) {
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === selectedFileForAccess.id
            ? { ...file, accessLevel, sharedUsers: users }
            : file
        )
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
     
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and organize your files</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{filteredFiles.length}</span> files total
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Search Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <SearchBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableTags={availableTags}
              />
            </div>

            {/* File List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <FileList
                files={paginatedFiles}
                pagination={pagination}
                onPageChange={handlePageChange}
                onFileClick={handleFileClick}
                onAddTag={handleAddTag}
                onManageAccess={handleManageAccess}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                onViewVersions={handleViewVersions}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Access Management Modal */}
      {selectedFileForAccess && (
        <AccessManagementModal
          isOpen={accessModalOpen}
          onClose={() => {
            setAccessModalOpen(false);
            setSelectedFileForAccess(null);
          }}
          fileName={selectedFileForAccess.filename}
          currentAccessLevel={selectedFileForAccess.accessLevel || 'private'}
          sharedUsers={selectedFileForAccess.sharedUsers || []}
          onUpdateAccess={handleUpdateAccess}
        />
      )}
    </div>
  );
};

export default Dashboard;