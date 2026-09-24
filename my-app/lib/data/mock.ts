import type { Trail } from '@/lib/types';
export const photos = {
 hero: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=2400&q=85',
 oregon: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1100&q=85',
 yosemite: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=85',
 washington: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
 falls: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=85',
 lake: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85',
};
const seed = [
 ['multnomah-falls','Multnomah Falls','Columbia River Gorge, Oregon','Moderate',2.6,813,'2 hr',4.8,1248,photos.falls,-122.1158,45.5785],
 ['wahclella-falls','Wahclella Falls','Columbia River Gorge, Oregon','Easy',2,291,'1 hr 20 min',4.9,862,photos.oregon,-121.9535,45.6303],
 ['latourell-falls','Latourell Falls','Columbia River Gorge, Oregon','Easy',2.4,625,'1 hr 30 min',4.8,726,photos.falls,-122.217,45.538],
 ['panther-creek-falls','Panther Creek Falls','Gifford Pinchot, Washington','Easy',0.5,200,'30 min',4.8,318,photos.oregon,-121.828,45.867],
 ['dog-mountain','Dog Mountain','Columbia River Gorge, Washington','Hard',6.9,2828,'4 hr 30 min',4.9,1043,photos.washington,-121.705,45.699],
 ['mirror-lake','Mirror Lake Trail','Mount Hood, Oregon','Moderate',4.2,672,'2 hr 15 min',4.7,915,photos.lake,-121.784,45.306],
] as const;
export const trails: Trail[] = seed.map(([slug,name,location,difficulty,distance,elevation,duration,rating,reviews,photo,lng,lat]) => ({id:slug,slug,name,location,difficulty,distance,elevation,duration,rating,reviews,photo,activity:distance < 1 ? 'Walking' : 'Hiking',coordinates:[lng,lat],description:`Follow a beautiful Pacific Northwest trail through towering evergreens and quiet stretches of wilderness. ${name} is a memorable stop for a day outside. Expect uneven ground and take time to enjoy the views. Check current access and conditions before setting out.`,photos:[{url:photo,alt:name},{url:photos.oregon,alt:'Evergreen forest'},{url:photos.lake,alt:'Mountain landscape'}],conditions:[{id:'1',author:'Alex M.',date:'Sample report',description:'A peaceful morning on the trail. Some muddy sections under the trees; shoes with good traction were helpful.'}]}));
