import { Planner } from '@/components/planner/planner';
export default async function TripPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Planner id={id}/>}
