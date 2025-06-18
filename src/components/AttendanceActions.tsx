'use client';

import { Button } from '@/components/ui/button';
import type { AttendanceRecord } from '@/types';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttendanceActionsProps {
  records: AttendanceRecord[];
}

export function AttendanceActions({ records }: AttendanceActionsProps) {
  const { toast } = useToast();

  const exportToCSV = () => {
    if (records.length === 0) {
      toast({
        variant: "default",
        title: "No Data",
        description: "There are no attendance records to export.",
      });
      return;
    }

    const headers = ['Employee ID', 'Employee Name', 'Date', 'Time', 'Type (In/Out)', 'Anomalous', 'Anomaly Explanation'];
    const csvRows = [
      headers.join(','),
      ...records.map(record => [
        record.employeeId,
        record.employeeName, // Added employee name
        record.date,
        record.time,
        record.type,
        record.isAnomalous ? 'Yes' : 'No',
        `"${record.anomalyExplanation?.replace(/"/g, '""') || ''}"` // Escape double quotes
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `TimeWise_Attendance_Export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Export Successful",
        description: "Attendance data has been exported to CSV.",
      });
    } else {
       toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Your browser does not support this feature.",
      });
    }
  };

  return (
    <div className="flex justify-end mt-4">
      <Button onClick={exportToCSV} variant="outline" className="text-accent border-accent hover:bg-accent/10 hover:text-accent">
        <Download className="mr-2 h-4 w-4" />
        Export to CSV
      </Button>
    </div>
  );
}
