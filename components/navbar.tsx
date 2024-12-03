'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const { signOut } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Components' },
    { href: '/meetings', label: 'Meetings' },
    { href: '/resources', label: 'Resources' },
    { href: '/journey', label: 'Journey' },
  ];

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex gap-6 md:gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? 'text-primary border-b-2 border-primary -mb-[1px]' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center space-x-4">
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