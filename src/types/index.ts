
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: string; // ISO string
  type: 'in' | 'out';
  isAnomalous?: boolean;
  anomalyExplanation?: string;
  date: string; // YYYY-MM-DD for grouping
  time: string; // HH:mm:ss for display
}

export interface User {
  id: string;
  username: string;
  name: string;
  password?: string; // Password should not be stored long-term or directly like this in real apps
  role?: 'admin' | 'teacher'; // Added role
}
