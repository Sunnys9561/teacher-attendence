
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { addAttendanceRecord, getPreviousTimestamps } from '@/lib/attendanceStore';
import type { AttendanceRecord } from '@/types';
import { detectAttendanceAnomalies } from '@/ai/flows/detect-anomalies';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, LogOut } from 'lucide-react';

interface AttendanceClockProps {
  employeeId: string;
  employeeName: string;
  onRecordAdded: () => void;
}

export function AttendanceClock({ employeeId, employeeName, onRecordAdded }: AttendanceClockProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString()); 
    return () => clearInterval(timerId);
  }, []);

  const handleAttendanceAction = async (type: 'in' | 'out') => {
    setIsLoading(true);
    try {
      const now = new Date();
      const newTimestamp = now.toISOString();
      const previousTimestamps = getPreviousTimestamps(employeeId);

      let anomalyResult = { isAnomalous: false, explanation: 'Checked by AI.' };
      try {
         anomalyResult = await detectAttendanceAnomalies({
          employeeId: employeeId,
          employeeName: employeeName,
          timestamp: newTimestamp,
          previousTimestamps,
        });
      } catch (aiError) {
        console.error("AI Anomaly Detection Error:", aiError);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not perform anomaly detection. Proceeding without it.",
        });
        anomalyResult = { isAnomalous: false, explanation: 'AI check failed, assumed normal.' };
      }
      

      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        employeeId: employeeId,
        employeeName: employeeName,
        timestamp: newTimestamp,
        type,
        isAnomalous: anomalyResult.isAnomalous,
        anomalyExplanation: anomalyResult.explanation,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      addAttendanceRecord(newRecord);
      onRecordAdded(); 

      toast({
        title: `Successfully Clocked ${type === 'in' ? 'In' : 'Out'}`,
        description: `${employeeName} at ${newRecord.time}. ${anomalyResult.isAnomalous ? 'Anomaly detected.' : 'No anomalies.'}`,
        variant: anomalyResult.isAnomalous ? "destructive" : "default",
      });

    } catch (error) {
      console.error('Error during attendance action:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to clock ${type}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Record Your Time</CardTitle>
        <CardDescription className="text-center">
          Hello, <span className="font-semibold text-primary">{employeeName}</span>! Current Time: <span className="font-semibold text-lg text-primary">{currentTime || 'Loading...'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4 items-center">
        <Button
          onClick={() => handleAttendanceAction('in')}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 ease-in-out transform hover:scale-105"
          aria-label="Clock In"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
          Clock In
        </Button>
        <Button
          onClick={() => handleAttendanceAction('out')}
          disabled={isLoading}
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary/10 transition-all duration-200 ease-in-out transform hover:scale-105"
          aria-label="Clock Out"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
          Clock Out
        </Button>
      </CardContent>
    </Card>
  );
}
