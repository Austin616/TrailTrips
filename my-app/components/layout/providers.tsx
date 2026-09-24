'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { MotionConfig } from 'framer-motion';
export function Providers({children}:{children:React.ReactNode}) {const [client]=useState(()=>new QueryClient());return <QueryClientProvider client={client}><MotionConfig reducedMotion="user">{children}</MotionConfig></QueryClientProvider>}
