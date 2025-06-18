
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SiteHeader } from '@/components/SiteHeader';
import { getCurrentUser, logout, getAllUsers as getAllAuthUsers } from '@/lib/authStore';
import type { User, AttendanceRecord } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { DownloadCloud, Users, Settings, Mail, Loader2, AlertTriangle, KeyRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllAttendanceRecords as getAllLocalAttendanceRecords } from '@/lib/attendanceStore';
import { AttendanceTable } from '@/components/AttendanceTable';

function convertAttendanceToCSV(data: AttendanceRecord[]): string {
  if (!data || data.length === 0) {
    return 'id,employeeId,employeeName,timestamp,type,isAnomalous,anomalyExplanation,date,time\n';
  }
  const header = ['ID', 'Employee ID', 'Employee Name', 'Timestamp (ISO)', 'Type (In/Out)', 'Is Anomalous', 'Anomaly Explanation', 'Date (YYYY-MM-DD)', 'Time (HH:mm:ss)'];
  const csvRows = [
    header.join(','),
    ...data.map(record =>
      [
        `"${record.id}"`,
        `"${record.employeeId}"`,
        `"${record.employeeName}"`,
        `"${record.timestamp}"`,
        `"${record.type}"`,
        record.isAnomalous ? '"Yes"' : '"No"',
        `"${record.anomalyExplanation?.replace(/"/g, '""') || ''}"`,
        `"${record.date}"`,
        `"${record.time}"`
      ].join(',')
    )
  ];
  return csvRows.join('\n');
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isExportingTeacherList, setIsExportingTeacherList] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'admin') {
      setAdminUser(user);
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You must be an admin to view this page. Redirecting...',
      });
      router.replace('/admin/login');
    }
    setIsLoadingAuth(false);
  }, [router, toast]);

  const fetchAllData = useCallback(() => {
     if (adminUser) {
        setIsLoadingRecords(true);
        setIsLoadingUsers(true);
        const records = getAllLocalAttendanceRecords();
        setAllAttendance(records);
        setIsLoadingRecords(false);

        const users = getAllAuthUsers();
        setAllUsers(users);
        setIsLoadingUsers(false);
    }
  }, [adminUser]);


  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);


  const handleExportAllAttendance = () => {
    if (!adminUser) return;
    
    const recordsToExport = getAllLocalAttendanceRecords();

    if (recordsToExport.length === 0) {
      toast({
        title: 'No Data',
        description: 'There are no attendance records to export.',
      });
      return;
    }

    try {
      const csvData = convertAttendanceToCSV(recordsToExport);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `timewise_all_attendance_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'All attendance data has been downloaded as a CSV file.',
      });
    } catch (error) {
      console.error('Failed to export all attendance data:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred during CSV generation or download.',
      });
    }
  };

  const handleEmailTeacherList = async () => {
    if (!adminUser) return;
    setIsExportingTeacherList(true);
    try {
      const response = await fetch('/api/export-teachers', {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast({
          title: 'Teacher List Export Initiated',
          description: result.message || 'The teacher user list CSV has been sent to the admin email.',
        });
      } else {
        throw new Error(result.message || 'Failed to export teacher list.');
      }
    } catch (error) {
      console.error('Error exporting teacher list:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred while exporting the teacher list.',
      });
    } finally {
      setIsExportingTeacherList(false);
    }
  };


  const handleAdminLogout = () => {
    logout();
    router.push('/admin/login');
  };


  if (isLoadingAuth || !adminUser) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <SiteHeader />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
            <div className="space-y-4 mt-10">
                <p className="text-lg">Verifying admin access...</p>
                <Skeleton className="h-12 w-1/2 mx-auto" />
                <Skeleton className="h-8 w-1/3 mx-auto" />
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader user={adminUser} onLogout={handleAdminLogout} isAdminView={true}/>
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <Card className="shadow-2xl rounded-xl">
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle className="text-3xl font-headline flex items-center">
                        <Settings className="mr-3 h-8 w-8 text-primary" />
                        Admin Dashboard
                    </CardTitle>
                    <CardDescription>Manage teacher attendance, user accounts, and system settings.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center">
                  <Button onClick={handleExportAllAttendance} variant="outline" className="text-accent border-accent hover:bg-accent/10 hover:text-accent">
                      <DownloadCloud className="mr-2 h-5 w-5" />
                      Download All Attendance Logs
                  </Button>
                  <Button onClick={handleEmailTeacherList} variant="outline" disabled={isExportingTeacherList}>
                    {isExportingTeacherList ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Mail className="mr-2 h-5 w-5" />
                    )}
                    Email Teacher List to Admin
                  </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-6 text-primary flex items-center"><Users className="mr-3 h-7 w-7"/>All Teacher Attendance Records</h2>
            {isLoadingRecords ? (
                <div>
                    <Skeleton className="h-8 w-1/4 mb-4 rounded" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            ) : allAttendance.length > 0 ? (
              <AttendanceTable records={allAttendance} />
            ) : (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No attendance records found for any teacher yet.</p>
                <p className="text-sm text-muted-foreground">Teachers can start clocking in/out on the main application.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-2xl rounded-xl">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-headline flex items-center">
                <KeyRound className="mr-3 h-7 w-7 text-primary" />
                User Account Management
            </CardTitle>
            <CardDescription>View and manage user accounts. Passwords shown below are for prototype demonstration only.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Security Warning!</AlertTitle>
              <AlertDescription>
                Displaying plaintext passwords, even for administrators, is a significant security risk and is <strong>not recommended for production systems</strong>.
                Passwords should always be stored hashed and never be directly viewable. This feature is for demonstration purposes in this prototype only.
              </AlertDescription>
            </Alert>
            {isLoadingUsers ? (
                <div>
                    <Skeleton className="h-8 w-1/4 mb-4 rounded" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            ) : allUsers.length > 0 ? (
                <ScrollArea className="h-[300px] rounded-md border">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-destructive">Password (Plaintext)</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {allUsers.map((user) => (
                            <TableRow key={user.id}>
                            <TableCell className="font-mono text-xs">{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell><span className={`capitalize px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>{user.role}</span></TableCell>
                            <TableCell className="font-mono text-destructive text-xs">{user.password}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            ) : (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No user accounts found.</p>
                <p className="text-sm text-muted-foreground">This should not happen as an admin account must exist.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} TimeWise Admin Panel. All rights reserved.
      </footer>
    </div>
  );
}
