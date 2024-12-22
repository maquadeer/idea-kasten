'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const { signOut } = useAuth();

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* Logo/Title */}
        <div className="font-bold text-lg">
          Cerebral Sync
        </div>

        {/* Right side content */}
        <div className="ml-auto flex items-center space-x-6">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
} 