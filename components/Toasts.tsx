'use client';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const WelcomeUser: React.FC<{ session; name: string }> = ({ session, name }) => {
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    if (session) {
      toast({
        title: 'Hello',
        description: `Hello, ${name}! It's nice to see you again!`,
      });
      router.push('/');
    }
  }, [session, name, toast, router]);

  return null;
};

export { WelcomeUser };
