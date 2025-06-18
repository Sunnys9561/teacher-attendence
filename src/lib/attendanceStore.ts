
'use client';

import type { AttendanceRecord } from '@/types';

const STORAGE_KEY = 'timeWiseAttendanceRecords';
const DEFAULT_EMPLOYEE_ID = "user123";

export const getAttendanceRecords = (employeeId: string = DEFAULT_EMPLOYEE_ID): AttendanceRecord[] => {
  if (typeof window === 'undefined') return [];
  const storedRecords = localStorage.getItem(STORAGE_KEY);
  if (storedRecords) {
    try {
      const records: AttendanceRecord[] = JSON.parse(storedRecords);
      return records.filter(record => record.employeeId === employeeId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error("Failed to parse attendance records from localStorage", error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }
  return [];
};

export const addAttendanceRecord = (record: AttendanceRecord): void => {
  if (typeof window === 'undefined') return;
  const allStoredRecords = localStorage.getItem(STORAGE_KEY);
  let allRecords: AttendanceRecord[] = [];
  if (allStoredRecords) {
    try {
      allRecords = JSON.parse(allStoredRecords);
    } catch (error) {
      console.error("Failed to parse all attendance records from localStorage during add", error);
      allRecords = [];
    }
  }

  const otherEmployeeRecords = allRecords.filter(r => r.employeeId !== record.employeeId);
  let employeeRecords = allRecords.filter(r => r.employeeId === record.employeeId);
  employeeRecords.unshift(record);
  employeeRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const updatedRecords = [...otherEmployeeRecords, ...employeeRecords];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
};

export const getPreviousTimestamps = (employeeId: string = DEFAULT_EMPLOYEE_ID): string[] => {
  const records = getAttendanceRecords(employeeId);
  return records.map(r => r.timestamp).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
};

export const getAllAttendanceRecords = (): AttendanceRecord[] => {
  if (typeof window === 'undefined') return [];
  const storedRecords = localStorage.getItem(STORAGE_KEY);
  if (storedRecords) {
    try {
      const records: AttendanceRecord[] = JSON.parse(storedRecords);
      // Sort all records by timestamp (descending), then by employee name for consistent ordering
      return records.sort((a, b) => {
        const dateComparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        if (dateComparison !== 0) return dateComparison;
        return (a.employeeName || a.employeeId).localeCompare(b.employeeName || b.employeeId);
      });
    } catch (error) {
      console.error("Failed to parse all attendance records from localStorage", error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }
  return [];
};
