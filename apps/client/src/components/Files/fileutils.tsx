import {
  File,
  FileText,
  FileSpreadsheet,
  Image,
  Video,
  Palette,
  Database,
} from "lucide-react"; // adjust based on your icon source

export const getFileType = (extension: string): string => {
  switch (extension.toLowerCase()) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "svg":
      return "image";
    case "mp4":
    case "mkv":
    case "mov":
    case "avi":
    case "webm":
      return "video";
    case "pdf":
      return "pdf";
    case "ppt":
    case "pptx":
      return "presentation";
    case "xls":
    case "xlsx":
    case "csv":
      return "spreadsheet";
    case "psd":
    case "fig":
    case "sketch":
    case "xd":
      return "design";
    case "doc":
    case "docx":
    case "txt":
    case "rtf":
      return "document";
    case "sql":
    case "json":
    case "xml":
    case "yaml":
    case "yml":
    case "db":
    case "mdb":
      return "data";
    default:
      return "other";
  }
};

export const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="w-8 h-8 text-red-500" />;
    case "image":
      return <Image className="w-8 h-8 text-green-500" />;
    case "video":
      return <Video className="w-8 h-8 text-purple-500" />;
    case "presentation":
      return <FileText className="w-8 h-8 text-orange-500" />;
    case "spreadsheet":
      return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
    case "design":
      return <Palette className="w-8 h-8 text-pink-500" />;
    case "document":
      return <FileText className="w-8 h-8 text-blue-500" />;
    case "data":
      return <Database className="w-8 h-8 text-indigo-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
};

export const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return "bg-red-50 text-red-700 border-red-200";
    case "image":
      return "bg-green-50 text-green-700 border-green-200";
    case "video":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "presentation":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "spreadsheet":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "design":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "document":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "data":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};
