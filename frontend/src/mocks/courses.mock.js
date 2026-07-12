/**
 * courses.mock.js
 *
 * Static mock data for academic courses, teachers, and initial course-teacher assignments.
 * Used while backend endpoints for GET /api/courses and GET /api/teachers are under development.
 *
 * TODO (Story 13): Replace this with real API calls:
 * - GET /api/courses
 * - GET /api/teachers
 * - POST /api/courses/:courseId/teachers
 * - DELETE /api/courses/:courseId/teachers/:teacherId
 */

export const MOCK_COURSES = [
  {
    id: 'c1',
    code: 'CSE-3106',
    title: 'Software Engineering',
    department: 'CSE',
    creditHours: 3,
    batchSemester: '2022-2023',
    description: 'Principles, methods, and tools for designing and building large-scale software systems.',
  },
  {
    id: 'c2',
    code: 'CSE-1201',
    title: 'Data Structures',
    department: 'CSE',
    creditHours: 4,
    batchSemester: '2023-2024',
    description: 'Introduction to basic data structures: arrays, linked lists, stacks, queues, trees, graphs, and hash tables.',
  },
  {
    id: 'c3',
    code: 'CSE-2203',
    title: 'Database Management Systems',
    department: 'CSE',
    creditHours: 3,
    batchSemester: '2022-2023',
    description: 'Relational model, database design, query languages, and transaction processing concepts.',
  },
  {
    id: 'c4',
    code: 'EEE-1101',
    title: 'Electrical Circuits',
    department: 'EEE',
    creditHours: 3,
    batchSemester: '2023-2024',
    description: 'Fundamental laws, network theorems, and analysis of DC and AC circuits.',
  },
  {
    id: 'c5',
    code: 'ME-2101',
    title: 'Fluid Mechanics',
    department: 'ME',
    creditHours: 3,
    batchSemester: '2022-2023',
    description: 'Fluid statics, dynamics, Bernoulli equation, momentum equations, and viscous flows.',
  },
  {
    id: 'c6',
    code: 'ENG-1101',
    title: 'Introduction to Literature',
    department: 'ENG',
    creditHours: 3,
    batchSemester: '2024-2025',
    description: 'Analysis of key poems, plays, novels, and short stories from different literary eras.',
  },
  {
    id: 'c7',
    code: 'BBA-1202',
    title: 'Principles of Marketing',
    department: 'BBA',
    creditHours: 3,
    batchSemester: '2023-2024',
    description: 'Study of marketing concepts, customer relationships, marketing environment, and strategies.',
  },
  {
    id: 'c8',
    code: 'CE-3101',
    title: 'Structural Analysis',
    department: 'CE',
    creditHours: 4,
    batchSemester: '2021-2022',
    description: 'Analysis of statically determinate and indeterminate beams, trusses, and frames.',
  }
];

export const MOCK_TEACHERS = [
  {
    id: 't1',
    name: 'Dr. Anisur Rahman',
    email: 'anisur.rahman@campushive.edu',
    department: 'CSE',
    designation: 'Professor',
  },
  {
    id: 't2',
    name: 'Samia Akhter',
    email: 'samia.akhter@campushive.edu',
    department: 'CSE',
    designation: 'Assistant Professor',
  },
  {
    id: 't3',
    name: 'Tanvirul Islam',
    email: 'tanvirul.islam@campushive.edu',
    department: 'EEE',
    designation: 'Lecturer',
  },
  {
    id: 't4',
    name: 'Dr. Farhana Jasmine',
    email: 'farhana.jasmine@campushive.edu',
    department: 'ME',
    designation: 'Associate Professor',
  },
  {
    id: 't5',
    name: 'Kamrul Hasan',
    email: 'kamrul.hasan@campushive.edu',
    department: 'CSE',
    designation: 'Lecturer',
  },
  {
    id: 't6',
    name: 'Tasnim Alam',
    email: 'tasnim.alam@campushive.edu',
    department: 'ENG',
    designation: 'Lecturer',
  },
  {
    id: 't7',
    name: 'Ziaur Rahman',
    email: 'ziaur.rahman@campushive.edu',
    department: 'BBA',
    designation: 'Associate Professor',
  },
  {
    id: 't8',
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan@campushive.edu',
    department: 'CE',
    designation: 'Assistant Professor',
  }
];

export const INITIAL_ASSIGNMENTS = {
  'c1': ['t1', 't2'],
  'c2': ['t2'],
  'c3': [],
  'c4': ['t3'],
  'c5': [],
  'c6': ['t6'],
  'c7': ['t7'],
  'c8': ['t8'],
};
