import React from 'react';
import { FileItem, PaginationInfo } from '../../types';
import FileCard from './FileCard';
import Pagination from './Pagination';
import { FileX, Loader2 } from 'lucide-react';

interface FileListProps {
  files: FileItem[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onFileClick: (file: FileItem) => void;
  onAddTag?: (fileId: string, tag: string) => void;
  onManageAccess?: (fileId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onRenameFile?: (fileId: string, newName: string) => void;
  onViewVersions?: (fileId: string) => void;
  loading?: boolean;
}

const FileList: React.FC<FileListProps> = ({
  files,
  pagination,
  onPageChange,
  onFileClick,
  onAddTag,
  onManageAccess,
  onDeleteFile,
  onRenameFile,
  onViewVersions,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading files...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We couldn't find any files matching your search criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)}</span> to{' '}
          <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of{' '}
          <span className="font-medium">{pagination.totalItems}</span> files
        </p>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onFileClick={onFileClick}
            onAddTag={onAddTag}
            onManageAccess={onManageAccess}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
            onViewVersions={onViewVersions}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default FileList;