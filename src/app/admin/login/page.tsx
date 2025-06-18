
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, getCurrentUser } from '@/lib/authStore';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const user = login(username, password);

    if (user && user.role === 'admin') {
      toast({
        title: 'Admin Login Successful',
        description: `Welcome, ${user.name}! Redirecting...`,
      });
      router.push('/admin/dashboard');
    } else if (user) {
        toast({
        variant: 'destructive',
        title: 'Authorization Failed',
        description: 'You do not have admin privileges for this login.',
      });
      setPassword('');
    }
    else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid admin username or password.',
      });
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Admin Login</CardTitle>
          <CardDescription>Enter admin credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Admin Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g., admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : <><LogIn className="mr-2"/> Login to Admin</>}
            </Button>
             <Link href="/login" className="text-sm text-primary hover:underline text-center w-full">
                Teacher Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
