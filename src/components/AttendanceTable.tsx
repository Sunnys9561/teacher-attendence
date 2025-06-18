'use client';

import type { AttendanceRecord } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle2, Info, UserCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  if (records.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No attendance records yet. Clock in to start tracking!</p>;
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border shadow-md">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[150px]">Employee</TableHead>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead className="w-[120px]">Time</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead className="text-center w-[120px]">Status</TableHead>
            <TableHead className="min-w-[200px]">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className={record.isAnomalous ? 'bg-destructive/10 hover:bg-destructive/20' : 'hover:bg-muted/50'}>
              <TableCell>
                <div className="flex items-center">
                  <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  {record.employeeName || record.employeeId}
                </div>
              </TableCell>
              <TableCell className="font-medium">{record.date}</TableCell>
              <TableCell>{record.time}</TableCell>
              <TableCell>
                <Badge variant={record.type === 'in' ? 'default' : 'secondary'} className={record.type === 'in' ? 'bg-accent text-accent-foreground' : ''}>
                  {record.type === 'in' ? 'Clock In' : 'Clock Out'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger>
                      {record.isAnomalous ? (
                        <AlertTriangle className="h-5 w-5 text-destructive inline-block" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500 inline-block" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border shadow-lg">
                      <p>{record.isAnomalous ? 'Potential Anomaly' : 'Normal'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                 {record.anomalyExplanation ? (
                    <TooltipProvider>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger className="flex items-center cursor-help">
                                <Info className="h-4 w-4 mr-1 text-primary"/>
                                <span className="truncate max-w-[250px]">{record.anomalyExplanation}</span>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" className="max-w-xs bg-background border shadow-lg p-3">
                                <p className="text-sm">{record.anomalyExplanation}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                 ) : (
                    "No specific details."
                 )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
