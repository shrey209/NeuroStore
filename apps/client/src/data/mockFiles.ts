import { FileItem } from '../types';

export const mockFiles: FileItem[] = [
  {
    id: '1',
    filename: 'quarterly-report-2024.pdf',
    tags: ['report', 'business', 'finance', '2024'],
    size: 2457600, // 2.4 MB
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    type: 'pdf',
    accessLevel: 'shared',
    sharedUsers: [
      { id: '1', email: 'manager@company.com', name: 'Manager', permission: 'view' }
    ]
  },
  {
    id: '2',
    filename: 'team-photo-summit.jpg',
    tags: ['photo', 'team', 'event', 'summit'],
    size: 5242880, // 5 MB
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    type: 'image',
    accessLevel: 'public'
  },
  {
    id: '3',
    filename: 'project-presentation.pptx',
    tags: ['presentation', 'project', 'slides'],
    size: 8388608, // 8 MB
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-11'),
    type: 'presentation',
    accessLevel: 'private'
  },
  {
    id: '4',
    filename: 'user-research-data.xlsx',
    tags: ['research', 'data', 'analysis', 'users'],
    size: 1048576, // 1 MB
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-09'),
    type: 'spreadsheet',
    accessLevel: 'shared',
    sharedUsers: [
      { id: '2', email: 'researcher@company.com', name: 'Researcher', permission: 'edit' },
      { id: '3', email: 'analyst@company.com', name: 'Analyst', permission: 'view' }
    ]
  },
  {
    id: '5',
    filename: 'design-mockups-v2.fig',
    tags: ['design', 'mockup', 'ui', 'figma'],
    size: 15728640, // 15 MB
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06'),
    type: 'design',
    accessLevel: 'shared',
    sharedUsers: [
      { id: '4', email: 'designer@company.com', name: 'Designer', permission: 'admin' }
    ]
  },
  {
    id: '6',
    filename: 'meeting-recording-jan.mp4',
    tags: ['meeting', 'recording', 'video', 'january'],
    size: 104857600, // 100 MB
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    type: 'video',
    accessLevel: 'private'
  },
  {
    id: '7',
    filename: 'api-documentation.md',
    tags: ['documentation', 'api', 'technical', 'guide'],
    size: 524288, // 512 KB
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    type: 'document',
    accessLevel: 'public'
  },
  {
    id: '8',
    filename: 'contract-template.docx',
    tags: ['contract', 'template', 'legal', 'document'],
    size: 786432, // 768 KB
    createdAt: new Date('2023-12-28'),
    updatedAt: new Date('2023-12-29'),
    type: 'document',
    accessLevel: 'private'
  },
  {
    id: '9',
    filename: 'budget-analysis-q4.csv',
    tags: ['budget', 'analysis', 'finance', 'q4'],
    size: 262144, // 256 KB
    createdAt: new Date('2023-12-25'),
    updatedAt: new Date('2023-12-26'),
    type: 'data',
    accessLevel: 'shared',
    sharedUsers: [
      { id: '5', email: 'finance@company.com', name: 'Finance Team', permission: 'edit' }
    ]
  },
  {
    id: '10',
    filename: 'brand-guidelines.pdf',
    tags: ['brand', 'guidelines', 'design', 'standards'],
    size: 3145728, // 3 MB
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2023-12-21'),
    type: 'pdf',
    accessLevel: 'public'
  },
  {
    id: '11',
    filename: 'client-feedback-survey.xlsx',
    tags: ['feedback', 'survey', 'client', 'data'],
    size: 1572864, // 1.5 MB
    createdAt: new Date('2023-12-18'),
    updatedAt: new Date('2023-12-19'),
    type: 'spreadsheet',
    accessLevel: 'private'
  },
  {
    id: '12',
    filename: 'product-roadmap.png',
    tags: ['roadmap', 'product', 'planning', 'strategy'],
    size: 2097152, // 2 MB
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-16'),
    type: 'image',
    accessLevel: 'shared',
    sharedUsers: [
      { id: '6', email: 'product@company.com', name: 'Product Manager', permission: 'admin' },
      { id: '7', email: 'dev@company.com', name: 'Dev Team', permission: 'view' }
    ]
  }
];


 // Mock data for demonstration
  // const mockFiles: SharedFile[] = [
  //   {
  //     file_id: '1',
  //     user: 'user123',
  //     file_name: 'Project Proposal.pdf',
  //     file_extension: 'pdf',
  //     file_size: 2048576,
  //     mime_type: 'application/pdf',
  //     is_public: true,
  //     tags: ['important', 'project', 'proposal'],
  //     shared_with: [],
  //     metadata: [],
  //     uploaded_at: '2024-01-15T10:30:00Z'
  //   },
  //   {
  //     file_id: '2',
  //     user: 'user123',
  //     file_name: 'Design Mockup.fig',
  //     file_extension: 'fig',
  //     file_size: 5242880,
  //     mime_type: 'application/octet-stream',
  //     is_public: false,
  //     tags: ['design', 'ui', 'mockup', 'figma'],
  //     shared_with: [
  //       { user_id: 'user456', access_level: 'read' },
  //       { user_id: 'user789', access_level: 'write' }
  //     ],
  //     metadata: [],
  //     uploaded_at: '2024-01-14T14:22:00Z'
  //   },
  //   {
  //     file_id: '3',
  //     user: 'user123',
  //     file_name: 'Data Analysis.xlsx',
  //     file_extension: 'xlsx',
  //     file_size: 1048576,
  //     mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     is_public: false,
  //     tags: ['data', 'analysis', 'spreadsheet'],
  //     shared_with: [],
  //     metadata: [],
  //     uploaded_at: '2024-01-13T09:15:00Z'
  //   },
  //   {
  //     file_id: '4',
  //     user: 'user123',
  //     file_name: 'Profile Picture.jpg',
  //     file_extension: 'jpg',
  //     file_size: 512000,
  //     mime_type: 'image/jpeg',
  //     is_public: true,
  //     tags: ['profile', 'photo', 'personal'],
  //     shared_with: [],
  //     metadata: [],
  //     uploaded_at: '2024-01-12T16:45:00Z'
  //   },
  //   {
  //     file_id: '5',
  //     user: 'user123',
  //     file_name: 'Marketing Video.mp4',
  //     file_extension: 'mp4',
  //     file_size: 52428800,
  //     mime_type: 'video/mp4',
  //     is_public: false,
  //     tags: ['marketing', 'video', 'campaign', 'promotion'],
  //     shared_with: [
  //       { user_id: 'user456', access_level: 'read' }
  //     ],
  //     metadata: [],
  //     uploaded_at: '2024-01-11T11:20:00Z'
  //   },
  //   {
  //     file_id: '6',
  //     user: 'user123',
  //     file_name: 'Database Schema.sql',
  //     file_extension: 'sql',
  //     file_size: 204800,
  //     mime_type: 'application/sql',
  //     is_public: false,
  //     tags: ['database', 'schema', 'development'],
  //     shared_with: [],
  //     metadata: [],
  //     uploaded_at: '2024-01-10T08:30:00Z'
  //   }
  // ];
