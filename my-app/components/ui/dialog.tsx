'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
export const Dialog=DialogPrimitive.Root;
export const DialogTrigger=DialogPrimitive.Trigger;
export const DialogTitle=DialogPrimitive.Title;
export const DialogDescription=DialogPrimitive.Description;
export function DialogContent({children,className,...props}:React.ComponentProps<typeof DialogPrimitive.Content>){return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"/><DialogPrimitive.Content  {...props} className={cn("fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl",className)}>{children}<DialogPrimitive.Close aria-label="Close dialog" className="absolute right-5 top-5 rounded p-1 hover:bg-stone-100"><X size={20}/></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>}
