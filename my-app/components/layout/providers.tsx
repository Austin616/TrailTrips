'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/components/auth/auth-provider';
import { MotionConfig } from 'framer-motion';
export function Providers({children}:{children:React.ReactNode}) {const [client]=useState(()=>new QueryClient());return <QueryClientProvider client={client}><AuthProvider><MotionConfig reducedMotion="user">{children}</MotionConfig></AuthProvider></QueryClientProvider>}
