'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dock } from '@/components/ui/dock';
import { cn } from '@/lib/utils';
import { Component, FileText, Calendar, Route } from 'lucide-react';

export function FloatingDock() {
  const pathname = usePathname();

  // Hide dock on auth pages
  if (pathname.startsWith('/auth')) {
    return null;
  }

  const navItems = [
    { 
      href: '/', 
      label: 'Components',
      icon: Component
    },
    { 
      href: '/meetings', 
      label: 'Meetings',
      icon: Calendar
    },
    { 
      href: '/resources', 
      label: 'Resources',
      icon: FileText
    },
    { 
      href: '/journey', 
      label: 'Journey',
      icon: Route
    },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <Dock>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-3 hover:bg-accent rounded-lg transition-colors",
                pathname === item.href && "bg-accent"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </Dock>
    </div>
  );
} 