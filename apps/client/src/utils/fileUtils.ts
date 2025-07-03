export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return 'FileText';
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'presentation':
      return 'Presentation';
    case 'spreadsheet':
      return 'FileSpreadsheet';
    case 'design':
      return 'Palette';
    case 'document':
      return 'FileText';
    case 'data':
      return 'Database';
    default:
      return 'File';
  }
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};


export const BASE_URL="http://localhost:4000"