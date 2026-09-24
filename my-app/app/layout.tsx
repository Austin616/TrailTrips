import type { Metadata } from 'next';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Providers } from '@/components/layout/providers';
import { Navigation, Footer } from '@/components/layout/navigation';
export const metadata:Metadata={title:'TrailTrips — A little planning. A lot of possibility.',description:'Bring your hikes, stays, and everyday adventures together in one thoughtful trip planner.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Providers><Navigation/>{children}<Footer/></Providers></body></html>}
