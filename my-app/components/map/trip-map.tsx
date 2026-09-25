'use client';
import { useEffect, useRef, useState } from 'react';
import { Map, MapPin, ExternalLink, RotateCcw } from 'lucide-react';
import type { Trail } from '@/lib/types';

type MapTrail = Pick<Trail, 'id' | 'name' | 'slug' | 'coordinates'>;
export function TripMap({ trails, selectedTrailId }: { trails: Trail[]; selectedTrailId?: string | null }) {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<import('mapbox-gl').Map | null>(null);
  const markers = useRef<{ id: string; marker: import('mapbox-gl').Marker }[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  // A stable dependency keeps the map intact when unrelated itinerary state changes.
  const mapData = JSON.stringify(trails.map(({ id, name, slug, coordinates }) => ({ id, name, slug, coordinates })));
  useEffect(() => {
    if (!token || !container.current) return;
    const locations: MapTrail[] = JSON.parse(mapData);
    if (!locations.length) return;
    let disposed = false;
    let map: import('mapbox-gl').Map | undefined;
    let observer: ResizeObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    import('mapbox-gl').then(({ default: mapbox }) => {
      if (disposed || !container.current) return;
      setStatus('loading');
      if (!mapbox.supported()) { setStatus('failed'); return; }
      map = new mapbox.Map({ container: container.current, accessToken: token, style: 'mapbox://styles/mapbox/outdoors-v12', center: locations[0].coordinates, zoom: 11, cooperativeGestures: true });
      instance.current = map;
      map.addControl(new mapbox.NavigationControl({ visualizePitch: true }), 'top-right');
      map.addControl(new mapbox.ScaleControl({ unit: 'imperial' }), 'bottom-left');
      timeout = setTimeout(() => { if (!disposed) setStatus('failed'); }, 15000);
      map.on('load', () => { clearTimeout(timeout); if (!disposed) setStatus('ready'); });
      map.on('error', event => {
        // A bad token/style cannot render a map; isolated tile errors can recover.
        if ('status' in event.error && [401, 403].includes(Number(event.error.status))) { clearTimeout(timeout); if (!disposed) setStatus('failed'); }
      });
      markers.current = locations.map((trail, index) => {
        const pin = document.createElement('button');
        pin.className = 'real-map-pin'; pin.textContent = String(index + 1);
        pin.setAttribute('aria-label', `Show ${trail.name}`);
        const content = document.createElement('div'); content.className = 'trail-map-popup';
        const title = document.createElement('strong'); title.textContent = trail.name;
        const link = document.createElement('a'); link.href = `/trails/${encodeURIComponent(trail.slug)}`; link.textContent = 'View trail →';
        content.append(title, link);
        const marker = new mapbox.Marker({ element: pin }).setLngLat(trail.coordinates).setPopup(new mapbox.Popup({ offset: 22 }).setDOMContent(content)).addTo(map!);
        return { id: trail.id, marker };
      });
      if (locations.length > 1) {
        const bounds = new mapbox.LngLatBounds(); locations.forEach(trail => bounds.extend(trail.coordinates));
        map.fitBounds(bounds, { padding: 65, maxZoom: 12, duration: 0 });
      }
      observer = new ResizeObserver(() => map?.resize()); observer.observe(container.current);
    }).catch(() => { if (!disposed) setStatus('failed'); });
    return () => { disposed = true; clearTimeout(timeout); observer?.disconnect(); markers.current = []; instance.current = null; map?.remove(); };
  }, [token, mapData, attempt]);
  useEffect(() => {
    if (status !== 'ready' || !selectedTrailId || !instance.current) return;
    const selected = markers.current.find(item => item.id === selectedTrailId);
    if (!selected) return;
    markers.current.forEach(item => item.marker.getPopup()?.remove());
    instance.current.flyTo({ center: selected.marker.getLngLat(), zoom: 12, essential: false });
    selected.marker.togglePopup();
  }, [selectedTrailId, status, mapData]);
  const first = trails.find(t => t.id === selectedTrailId) ?? trails[0];
  const unavailable = !token || status === 'failed';
  return <div className="trip-map live-trail-map"><div ref={container} className="map-canvas" aria-label="Interactive trail map"/>
    {!trails.length ? <div className="map-empty"><MapPin size={28}/><h3>No trail locations yet</h3><p>Add a trail to see it on the map.</p></div> : unavailable ? <div className="map-empty"><Map size={30}/><h3>{token ? 'The map couldn’t load.' : 'Interactive map coming soon.'}</h3><p>{token ? 'Check your connection and try again.' : 'You can still explore this trail’s location.'}</p>{token && <button onClick={() => { setStatus('loading'); setAttempt(n => n + 1); }}><RotateCcw size={15}/>Try again</button>}<a href={`https://www.google.com/maps/search/?api=1&query=${first.coordinates[1]},${first.coordinates[0]}`} target="_blank" rel="noopener noreferrer">Open {first.name} in Google Maps <ExternalLink size={14}/></a></div> : <>{status === 'loading' && <div className="map-loading" role="status">Loading the outdoors…</div>}<span className="live-map-caption">Sample trail locations · map by Mapbox</span></>}
  </div>;
}
