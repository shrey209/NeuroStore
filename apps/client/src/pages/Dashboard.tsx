import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Sparkles, X, Plus } from 'lucide-react';
import FileCard from '../components/Files/FileCard';
import { SharedFile, SearchFilesDTO }from  '@neurostore/shared/types';
import { BASE_URL } from '../utils/fileUtils';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

 
  // TODO: Replace with actual API call
 useEffect(() => {
  const fetchFiles = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/file/search`, {
        query: searchQuery,
        page: currentPage,
        size: 10
      } , {
    withCredentials: true, 
  });

      setFiles(response.data.files || []);
      console.log(response.data.files)
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  fetchFiles();
}, [searchQuery, currentPage]);


  // TODO: Implement search functionality with backend
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: This will be sent to backend later
    const searchDTO: SearchFilesDTO = {
      query,
      page: currentPage,
      size: 20
    };
    console.log('Search with:', searchDTO);
  };

  // TODO: Implement semantic search functionality
  const handleSemanticSearch = () => {
    console.log('Semantic search triggered with query:', searchQuery);
    console.log('Selected tags for semantic search:', selectedTags);
    // TODO: Implement semantic search API call
    // This will use AI/ML to find semantically similar files
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeSelectedTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  // Filter files based on search query and selected tags
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => file.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage and organize your files</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleSemanticSearch}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Semantic Search</span>
                </button>
                
                <button 
                  onClick={() => setShowTagFilter(!showTagFilter)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter by Tags</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tag Filter Section */}
            {showTagFilter && (
              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Selected Tags:</span>
                  <button
                    onClick={clearAllTags}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200"
                    >
                      {tag}
                      <button
                        onClick={() => removeSelectedTag(tag)}
                        className="ml-2 hover:text-blue-900 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Grid/List */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500">Try adjusting your search query or filters</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredFiles.map((file) => (
              <FileCard key={file.file_id} file={file} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredFiles.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;