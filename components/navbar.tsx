'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { Menu, LogOut, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-lg">
          Collabrixo Team
        </Link>

        {/* Desktop Navigation */}
        <div className="ml-auto hidden md:flex items-center space-x-4">
          <Link href="/meetings">
            <Button variant="ghost">Meetings</Button>
          </Link>
          <Link href="/journey">
            <Button variant="ghost">Journey</Button>
          </Link>
          <Link href="/resources">
            <Button variant="ghost">Resources</Button>
          </Link>
          <ThemeToggle />
          {user && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="ml-auto flex md:hidden items-center space-x-4">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {user && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                )}
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Components
                  </Button>
                </Link>
                <Link href="/meetings" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Meetings
                  </Button>
                </Link>
                <Link href="/journey" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Journey
                  </Button>
                </Link>
                <Link href="/resources" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Resources
                  </Button>
                </Link>
                {user && (
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full justify-start gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
} 