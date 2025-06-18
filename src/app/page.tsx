
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { AttendanceClock } from '@/components/AttendanceClock';
import type { AttendanceRecord, User } from '@/types';
import { getAttendanceRecords } from '@/lib/attendanceStore';
import { getCurrentUser } from '@/lib/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AttendanceTable } from '@/components/AttendanceTable';
import { ListChecks, UserCheck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [clockStatus, setClockStatus] = useState<'in' | 'out' | 'none'>('none');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      }
    } else {
      router.replace('/login');
    }
    setIsLoadingAuth(false);
  }, [router]);

  const fetchRecords = useCallback(() => {
    if (currentUser && currentUser.role !== 'admin') {
      setIsLoadingRecords(true);
      const records = getAttendanceRecords(currentUser.id);
      setAttendanceRecords(records);
      if (records.length > 0) {
        setClockStatus(records[0].type);
      } else {
        setClockStatus('none');
      }
      setIsLoadingRecords(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      fetchRecords();
    }
  }, [currentUser, fetchRecords]);

  if (isLoadingAuth || !currentUser || currentUser.role === 'admin') {
    // Simplified skeleton for initial loading or admin redirect phase
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <SiteHeader user={currentUser} />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <div className="space-y-6 mt-10">
            <p className="text-lg text-muted-foreground">
              {isLoadingAuth ? "Loading user data..." : 
               !currentUser ? "Redirecting to login..." : 
               currentUser.role === 'admin' ? "Redirecting to admin dashboard..." : "Loading..."}
            </p>
            <Skeleton className="h-12 w-3/4 mx-auto rounded-lg" />
            <Skeleton className="h-64 w-full max-w-md mx-auto rounded-lg" />
            <Skeleton className="h-48 w-full max-w-2xl mx-auto rounded-lg" />
          </div>
        </main>
        <footer className="py-6 text-center">
          <Skeleton className="h-4 w-1/3 mx-auto rounded" />
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader user={currentUser} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-12">
          
          <div className="w-full max-w-md">
             <Card className="shadow-2xl rounded-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center justify-center">
                        <UserCheck className="mr-3 h-7 w-7 text-primary" />
                        Teacher Clock
                    </CardTitle>
                    {currentUser && !isLoadingRecords && (
                        <CardDescription className="text-center pt-2">
                            {clockStatus === 'in' && (
                                <span className="font-semibold text-accent">Status: You are currently Clocked IN.</span>
                            )}
                            {clockStatus === 'out' && (
                                <span className="font-semibold text-foreground">Status: You are currently Clocked OUT.</span>
                            )}
                            {clockStatus === 'none' && (
                                <span className="text-muted-foreground">Status: No recent clock activity.</span>
                            )}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <AttendanceClock
                        employeeId={currentUser.id}
                        employeeName={currentUser.name}
                        onRecordAdded={fetchRecords}
                    />
                </CardContent>
            </Card>
          </div>

          <div className="w-full max-w-4xl">
            <Card className="shadow-2xl rounded-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center">
                  <ListChecks className="mr-3 h-7 w-7 text-primary" />
                  My Attendance Log
                </CardTitle>
                <CardDescription>View your recent clock-in and clock-out activity. Your entries are saved locally in your browser.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecords ? (
                  <div>
                    <Skeleton className="h-8 w-1/3 mb-4 rounded" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </div>
                ) : attendanceRecords.length > 0 ? (
                  <AttendanceTable records={attendanceRecords} />
                ) : (
                  <div className="text-center py-10">
                    <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">No attendance records yet.</p>
                    <p className="text-sm text-muted-foreground">Your clock-ins and clock-outs will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} TimeWise Attendance. All rights reserved.
      </footer>
    </div>
  );
}
