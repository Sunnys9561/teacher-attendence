
'use client';

import { Clock, LogOut, UserCircle, ShieldCheck } from 'lucide-react';
import type { User } from '@/types';
import { Button } from './ui/button';
import { logout } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from './ui/avatar';

interface SiteHeaderProps {
  user?: Omit<User, 'password'> | null;
  onLogout?: () => void;
  isAdminView?: boolean;
}

export function SiteHeader({ user, onLogout, isAdminView = false }: SiteHeaderProps) {
  const router = useRouter();

  const handleStandardLogout = () => {
    logout();
    router.push('/login');
  };

  const effectiveLogoutHandler = onLogout || handleStandardLogout;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const appName = user?.role === 'admin' && isAdminView ? 'TimeWise Admin' : 'TimeWise Attendance';
  const homeLink = user?.role === 'admin' && isAdminView ? "/admin/dashboard" : "/";


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <a href={homeLink} className="mr-6 flex items-center space-x-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block font-headline">
              {appName}
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.username} ({user.role || 'teacher'})
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && !isAdminView && (
                  <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="cursor-pointer">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={effectiveLogoutHandler} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <UserCircle className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      </div>
    </header>
  );
}
