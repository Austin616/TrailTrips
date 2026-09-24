export interface TrailPhoto { url: string; alt: string }
export interface TrailCondition { id: string; author: string; date: string; description: string }
export interface Trail { id: string; slug: string; name: string; location: string; difficulty: 'Easy' | 'Moderate' | 'Hard'; distance: number; elevation: number; duration: string; rating: number; reviews: number; activity: 'Hiking' | 'Walking'; coordinates: [number, number]; photo: string; description: string; photos: TrailPhoto[]; conditions: TrailCondition[] }
export interface LodgingLocation { name: string; type: 'Hotel / Airbnb' | 'Campsite' | 'Car camping' | 'Custom location'; coordinates: [number, number] | null }
export interface TripStop { id: string; trailId: string; start: string; finish: string; driveMinutes: number }
export interface TripDay { id: string; date: string; title: string; stops: TripStop[] }
export interface Trip { id: string; name: string; destination: string; startDate: string; endDate: string; photo: string; lodging: LodgingLocation; days: TripDay[] }
