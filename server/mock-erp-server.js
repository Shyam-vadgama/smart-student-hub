/**
 * Mock College ERP API Server
 * 
 * This is a simple Express server that simulates a college ERP system
 * for testing the third-party integration feature.
 * 
 * Run with: node mock-erp-server.js
 * Server will run on: http://localhost:3001
 */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();


const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '') || 
                 req.headers['x-api-key'] || 
                 req.query.apiKey;
  
  if (apiKey !== 'test-api-key-12345') {
    return res.status(401).json({
      success: false,
      error: 'Invalid API Key'
    });
  }
  next();
};

// Mock Data
const students = [
  {
    id: 'CS2101',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@college.edu',
    department: 'Computer Science',
    year: 2,
    semester: 4,
    rollNumber: 'CS2101',
    phone: '+91-9876543210',
    dateOfBirth: '2003-05-15',
    address: 'Mumbai, Maharashtra'
  },
  {
    id: 'CS2102',
    name: 'Priya Patel',
    email: 'priya.patel@college.edu',
    department: 'Computer Science',
    year: 2,
    semester: 4,
    rollNumber: 'CS2102',
    phone: '+91-9876543211',
    dateOfBirth: '2003-08-22',
    address: 'Ahmedabad, Gujarat'
  },
  {
    id: 'CS2103',
    name: 'Amit Kumar',
    email: 'amit.kumar@college.edu',
    department: 'Computer Science',
    year: 2,
    semester: 4,
    rollNumber: 'CS2103',
    phone: '+91-9876543212',
    dateOfBirth: '2003-03-10',
    address: 'Delhi, India'
  },
  {
    id: 'EC2101',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@college.edu',
    department: 'Electronics',
    year: 2,
    semester: 4,
    rollNumber: 'EC2101',
    phone: '+91-9876543213',
    dateOfBirth: '2003-11-05',
    address: 'Hyderabad, Telangana'
  },
  {
    id: 'ME2101',
    name: 'Vikram Singh',
    email: 'vikram.singh@college.edu',
    department: 'Mechanical',
    year: 2,
    semester: 4,
    rollNumber: 'ME2101',
    phone: '+91-9876543214',
    dateOfBirth: '2003-07-18',
    address: 'Jaipur, Rajasthan'
  }
];

const faculty = [
  {
    id: 'FAC001',
    name: 'Dr. Amit Kumar',
    email: 'amit.kumar@college.edu',
    department: 'Computer Science',
    designation: 'Professor',
    specialization: 'Data Structures & Algorithms',
    phone: '+91-9876500001',
    experience: 15
  },
  {
    id: 'FAC002',
    name: 'Dr. Sunita Sharma',
    email: 'sunita.sharma@college.edu',
    department: 'Computer Science',
    designation: 'Associate Professor',
    specialization: 'Machine Learning',
    phone: '+91-9876500002',
    experience: 10
  },
  {
    id: 'FAC003',
    name: 'Prof. Rajesh Verma',
    email: 'rajesh.verma@college.edu',
    department: 'Electronics',
    designation: 'Assistant Professor',
    specialization: 'Digital Electronics',
    phone: '+91-9876500003',
    experience: 8
  }
];

const subjects = [
  {
    id: 'CS401',
    name: 'Data Structures',
    code: 'CS401',
    credits: 4,
    department: 'Computer Science',
    semester: 4,
    faculty: 'Dr. Amit Kumar'
  },
  {
    id: 'CS402',
    name: 'Database Management Systems',
    code: 'CS402',
    credits: 4,
    department: 'Computer Science',
    semester: 4,
    faculty: 'Dr. Sunita Sharma'
  },
  {
    id: 'CS403',
    name: 'Operating Systems',
    code: 'CS403',
    credits: 4,
    department: 'Computer Science',
    semester: 4,
    faculty: 'Dr. Amit Kumar'
  },
  {
    id: 'CS404',
    name: 'Computer Networks',
    code: 'CS404',
    credits: 3,
    department: 'Computer Science',
    semester: 4,
    faculty: 'Prof. Rajesh Verma'
  }
];

const attendance = [
  {
    id: 1,
    studentId: 'CS2101',
    studentName: 'Rahul Sharma',
    subject: 'Data Structures',
    subjectCode: 'CS401',
    date: '2024-01-15',
    status: 'present',
    time: '09:00 AM',
    faculty: 'Dr. Amit Kumar'
  },
  {
    id: 2,
    studentId: 'CS2102',
    studentName: 'Priya Patel',
    subject: 'Data Structures',
    subjectCode: 'CS401',
    date: '2024-01-15',
    status: 'present',
    time: '09:00 AM',
    faculty: 'Dr. Amit Kumar'
  },
  {
    id: 3,
    studentId: 'CS2103',
    studentName: 'Amit Kumar',
    subject: 'Data Structures',
    subjectCode: 'CS401',
    date: '2024-01-15',
    status: 'absent',
    time: '09:00 AM',
    faculty: 'Dr. Amit Kumar'
  },
  {
    id: 4,
    studentId: 'CS2101',
    studentName: 'Rahul Sharma',
    subject: 'Database Management Systems',
    subjectCode: 'CS402',
    date: '2024-01-15',
    status: 'present',
    time: '11:00 AM',
    faculty: 'Dr. Sunita Sharma'
  },
  {
    id: 5,
    studentId: 'CS2102',
    studentName: 'Priya Patel',
    subject: 'Database Management Systems',
    subjectCode: 'CS402',
    date: '2024-01-15',
    status: 'present',
    time: '11:00 AM',
    faculty: 'Dr. Sunita Sharma'
  }
];

const marks = [
  {
    id: 1,
    studentId: 'CS2101',
    studentName: 'Rahul Sharma',
    subject: 'Data Structures',
    subjectCode: 'CS401',
    examType: 'Midterm',
    marks: 85,
    maxMarks: 100,
    date: '2024-01-10',
    grade: 'A'
  },
  {
    id: 2,
    studentId: 'CS2102',
    studentName: 'Priya Patel',
    subject: 'Data Structures',
    subjectCode: 'CS401',
    examType: 'Midterm',
    marks: 92,
    maxMarks: 100,
    date: '2024-01-10',
    grade: 'A+'
  },
  {
    id: 3,
    studentId: 'CS2103',
    studentName: 'Amit Kumar',
    subject: 'Data Structures',
    subjectCode: 'CS401',
    examType: 'Midterm',
    marks: 78,
    maxMarks: 100,
    date: '2024-01-10',
    grade: 'B+'
  },
  {
    id: 4,
    studentId: 'CS2101',
    studentName: 'Rahul Sharma',
    subject: 'Database Management Systems',
    subjectCode: 'CS402',
    examType: 'Assignment 1',
    marks: 45,
    maxMarks: 50,
    date: '2024-01-12',
    grade: 'A'
  }
];

const timetable = [
  {
    id: 1,
    day: 'Monday',
    time: '09:00 AM - 10:00 AM',
    subject: 'Data Structures',
    subjectCode: 'CS401',
    faculty: 'Dr. Amit Kumar',
    room: 'Lab 101',
    department: 'Computer Science',
    semester: 4
  },
  {
    id: 2,
    day: 'Monday',
    time: '10:00 AM - 11:00 AM',
    subject: 'Database Management Systems',
    subjectCode: 'CS402',
    faculty: 'Dr. Sunita Sharma',
    room: 'Room 201',
    department: 'Computer Science',
    semester: 4
  },
  {
    id: 3,
    day: 'Monday',
    time: '11:00 AM - 12:00 PM',
    subject: 'Operating Systems',
    subjectCode: 'CS403',
    faculty: 'Dr. Amit Kumar',
    room: 'Room 202',
    department: 'Computer Science',
    semester: 4
  },
  {
    id: 4,
    day: 'Tuesday',
    time: '09:00 AM - 10:00 AM',
    subject: 'Computer Networks',
    subjectCode: 'CS404',
    faculty: 'Prof. Rajesh Verma',
    room: 'Lab 102',
    department: 'Computer Science',
    semester: 4
  }
];

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mock College ERP API Server',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      faculty: '/api/faculty',
      subjects: '/api/subjects',
      attendance: '/api/attendance',
      marks: '/api/marks',
      timetable: '/api/timetable'
    },
    authentication: {
      type: 'API Key',
      header: 'x-api-key or Authorization: Bearer',
      testKey: 'test-api-key-12345'
    }
  });
});

// Students endpoint
app.get('/api/students', validateApiKey, (req, res) => {
  const { department, year, page = 1, limit = 10 } = req.query;
  
  let filteredStudents = [...students];
  
  if (department) {
    filteredStudents = filteredStudents.filter(s => 
      s.department.toLowerCase().includes(department.toLowerCase())
    );
  }
  
  if (year) {
    filteredStudents = filteredStudents.filter(s => s.year === parseInt(year));
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedStudents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredStudents.length,
      totalPages: Math.ceil(filteredStudents.length / limit)
    },
    timestamp: new Date().toISOString()
  });
});

// Faculty endpoint
app.get('/api/faculty', validateApiKey, (req, res) => {
  const { department } = req.query;
  
  let filteredFaculty = [...faculty];
  
  if (department) {
    filteredFaculty = filteredFaculty.filter(f => 
      f.department.toLowerCase().includes(department.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: filteredFaculty,
    total: filteredFaculty.length,
    timestamp: new Date().toISOString()
  });
});

// Subjects endpoint
app.get('/api/subjects', validateApiKey, (req, res) => {
  const { department, semester } = req.query;
  
  let filteredSubjects = [...subjects];
  
  if (department) {
    filteredSubjects = filteredSubjects.filter(s => 
      s.department.toLowerCase().includes(department.toLowerCase())
    );
  }
  
  if (semester) {
    filteredSubjects = filteredSubjects.filter(s => s.semester === parseInt(semester));
  }
  
  res.json({
    success: true,
    data: filteredSubjects,
    total: filteredSubjects.length,
    timestamp: new Date().toISOString()
  });
});

// Attendance endpoint
app.get('/api/attendance', validateApiKey, (req, res) => {
  const { studentId, date, subject } = req.query;
  
  let filteredAttendance = [...attendance];
  
  if (studentId) {
    filteredAttendance = filteredAttendance.filter(a => a.studentId === studentId);
  }
  
  if (date) {
    filteredAttendance = filteredAttendance.filter(a => a.date === date);
  }
  
  if (subject) {
    filteredAttendance = filteredAttendance.filter(a => 
      a.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: filteredAttendance,
    total: filteredAttendance.length,
    timestamp: new Date().toISOString()
  });
});

// Marks endpoint
app.get('/api/marks', validateApiKey, (req, res) => {
  const { studentId, subject, examType } = req.query;
  
  let filteredMarks = [...marks];
  
  if (studentId) {
    filteredMarks = filteredMarks.filter(m => m.studentId === studentId);
  }
  
  if (subject) {
    filteredMarks = filteredMarks.filter(m => 
      m.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }
  
  if (examType) {
    filteredMarks = filteredMarks.filter(m => 
      m.examType.toLowerCase().includes(examType.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: filteredMarks,
    total: filteredMarks.length,
    timestamp: new Date().toISOString()
  });
});

// Timetable endpoint
app.get('/api/timetable', validateApiKey, (req, res) => {
  const { day, department, semester } = req.query;
  
  let filteredTimetable = [...timetable];
  
  if (day) {
    filteredTimetable = filteredTimetable.filter(t => 
      t.day.toLowerCase() === day.toLowerCase()
    );
  }
  
  if (department) {
    filteredTimetable = filteredTimetable.filter(t => 
      t.department.toLowerCase().includes(department.toLowerCase())
    );
  }
  
  if (semester) {
    filteredTimetable = filteredTimetable.filter(t => t.semester === parseInt(semester));
  }
  
  res.json({
    success: true,
    data: filteredTimetable,
    total: filteredTimetable.length,
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint (for testing webhook functionality)
app.post('/api/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  res.json({
    success: true,
    message: 'Webhook received successfully',
    receivedData: req.body
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      '/api/students',
      '/api/faculty',
      '/api/subjects',
      '/api/attendance',
      '/api/marks',
      '/api/timetable'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🎓 Mock College ERP API Server Running! 🎓         ║
║                                                            ║
║  Server URL: http://localhost:${PORT}                        ║
║  API Base URL: http://localhost:${PORT}/api                  ║
║                                                            ║
║  API Key: test-api-key-12345                              ║
║                                                            ║
║  Available Endpoints:                                      ║
║  ✓ GET  /api/students                                     ║
║  ✓ GET  /api/faculty                                      ║
║  ✓ GET  /api/subjects                                     ║
║  ✓ GET  /api/attendance                                   ║
║  ✓ GET  /api/marks                                        ║
║  ✓ GET  /api/timetable                                    ║
║                                                            ║
║  Test with:                                                ║
║  curl http://localhost:${PORT}/api/students \\                ║
║       -H "x-api-key: test-api-key-12345"                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
