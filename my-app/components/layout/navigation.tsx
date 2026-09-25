'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mountain, ArrowUpRight } from 'lucide-react';
import { AccountMenu } from '@/components/auth/account-menu';
import { useAuth } from '@/components/auth/auth-provider';
import { CreateTripButton } from '@/components/trips/create-trip-button';
export function Navigation(){const pathname=usePathname();const {user}=useAuth();return <header className="site-header"><Link href="/" className="brand"><span className="brand-icon"><Mountain size={25} strokeWidth={1.8}/></span>trailtrips<span className="brand-dot">.</span></Link><nav aria-label="Main navigation"><Link className={pathname==='/explore'?'active':''} href="/explore">Explore</Link><Link className={pathname.startsWith('/trips')?'active':''} href="/trips">My trips</Link></nav><div className="nav-action">{user&&<CreateTripButton label="Plan a trip"/>}<AccountMenu/></div></header>}
export function Footer(){return <footer className="site-footer"><Link className="brand" href="/"><Mountain size={22}/> trailtrips.</Link><span>A little planning. A lot of possibility.</span><Link href="/explore">Find your next adventure <ArrowUpRight size={16}/></Link></footer>}
