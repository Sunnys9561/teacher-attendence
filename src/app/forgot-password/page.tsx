
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Send, Smartphone } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [sentDateTime, setSentDateTime] = useState<Date | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const submissionTime = new Date();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSentDateTime(submissionTime);
    toast({
      title: 'Password Reset Requested',
      description: `If an account is associated with "${mobileNumber}", password reset instructions have been (simulated) sent to that number.`,
    });
    setMessageSent(true);
    setMobileNumber(''); // Clear the input field
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
           <div className="flex justify-center mb-4">
            <Smartphone className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Forgot Password</CardTitle>
          <CardDescription>
            {messageSent && sentDateTime
              ? `Password reset instructions were (simulated) sent to your mobile on ${sentDateTime.toLocaleDateString()} at ${sentDateTime.toLocaleTimeString()}. Check your mobile.`
              : "Enter your mobile number to receive password reset instructions."}
          </CardDescription>
        </CardHeader>
        {!messageSent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="e.g., +11234567890"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : <><Send className="mr-2 h-4 w-4"/> Send Reset Link</>}
              </Button>
              <Link href="/login" className="text-sm text-primary hover:underline text-center w-full">
                  Remember your password? Login
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent>
            <p className="text-center text-sm text-muted-foreground mt-2">
              You can now close this page or try logging in again.
            </p>
             <CardFooter className="flex flex-col gap-4 pt-6">
                <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">Back to Login</Button>
                </Link>
            </CardFooter>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
