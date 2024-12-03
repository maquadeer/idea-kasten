import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Collabrixo Team',
  description: 'Sign in to access your team workspace',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 