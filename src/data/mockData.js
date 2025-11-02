// TODO: Replace with API calls

export const recognizedFaces = [
  {
    id: 1,
    name: 'Jane Doe',
    role: 'Employee',
    status: 'Authorized',
    timestamp: '2023-11-02T10:30:00Z',
    imageUrl: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'John Smith',
    role: 'Visitor',
    status: 'Authorized',
    timestamp: '2023-11-02T10:32:15Z',
    imageUrl: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 3,
    name: 'Unknown',
    role: 'N/A',
    status: 'Unauthorized',
    timestamp: '2023-11-02T10:33:45Z',
    imageUrl: 'https://i.pravatar.cc/150?img=3',
  },
];

export const recognitionLogs = [
  {
    id: 101,
    date: '2023-11-02',
    time: '10:30:00',
    name: 'Jane Doe',
    status: 'Known',
    location: 'Main Entrance',
  },
  {
    id: 102,
    date: '2023-11-02',
    time: '10:32:15',
    name: 'John Smith',
    status: 'Known',
    location: 'Main Entrance',
  },
  {
    id: 103,
    date: '2023-11-02',
    time: '10:33:45',
    name: 'Unknown',
    status: 'Unknown',
    location: 'Restricted Area',
  },
  {
    id: 104,
    date: '2023-11-01',
    time: '15:10:20',
    name: 'Peter Jones',
    status: 'Known',
    location: 'Lobby',
  },
];

export const alerts = [
  {
    id: 1,
    message: 'Unauthorized person detected in Restricted Area.',
    timestamp: '2023-11-02T10:33:45Z',
  },
];

export const users = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'Administrator',
        notifications: {
            unauthorized: true,
            system_errors: true,
        }
    },
    {
        id: 2,
        name: 'Security Guard',
        email: 'guard1@example.com',
        role: 'Operator',
        notifications: {
            unauthorized: true,
            system_errors: false,
        }
    }
];
