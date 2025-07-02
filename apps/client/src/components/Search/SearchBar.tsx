import React, { useState } from 'react';
import { Search, Filter, X, Hash, Zap, Type } from 'lucide-react';
import { SearchFilters } from '../../types';

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ filters, onFiltersChange, availableTags }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleQueryChange = (query: string) => {
    onFiltersChange({ ...filters, query });
  };

  const handleSearchTypeChange = (searchType: SearchFilters['searchType']) => {
    onFiltersChange({ ...filters, searchType });
  };

  const handleTagToggle = (tag: string) => {
    const updatedTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag];
    
    onFiltersChange({ ...filters, selectedTags: updatedTags });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      searchType: 'normal',
      selectedTags: []
    });
  };

  const searchTypes = [
    { type: 'normal' as const, icon: Type, label: 'Normal Search', description: 'Search by filename' },
    { type: 'semantic' as const, icon: Zap, label: 'Semantic Search', description: 'AI-powered content search' },
    { type: 'tags' as const, icon: Hash, label: 'Tag Filter', description: 'Filter by tags' }
  ];

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search files..."
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            showFilters || filters.selectedTags.length > 0
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {filters.selectedTags.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {filters.selectedTags.length}
            </span>
          )}
        </button>
      </div>

      {/* Search Type Toggle */}
      <div className="flex space-x-2">
        {searchTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.type}
              onClick={() => handleSearchTypeChange(type.type)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filters.searchType === type.type
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              title={type.description}
            >
              <Icon className="w-4 h-4" />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Filter Options</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Tag Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                    filters.selectedTags.includes(tag)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.query || filters.selectedTags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {filters.query && (
            <div className="flex items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
              <span className="text-sm text-blue-700">"{filters.query}"</span>
              <button
                onClick={() => handleQueryChange('')}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {filters.selectedTags.map((tag) => (
            <div key={tag} className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
              <Hash className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-sm text-gray-700">{tag}</span>
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;