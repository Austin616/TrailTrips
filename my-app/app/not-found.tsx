import Link from 'next/link';
import { Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function NotFound(){return <main className="section page-main"><div className="empty-state"><Mountain size={40}/><h1>A little off the trail.</h1><p>We couldn’t find that page. There’s plenty more to explore.</p><Button asChild><Link href="/explore">Find a trail</Link></Button></div></main>}
