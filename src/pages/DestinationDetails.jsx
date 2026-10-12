import {useEffect,useMemo,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {ArrowLeft,CalendarDays,Clock3,ExternalLink,Heart,MapPin,Navigation,Plane,Search,Users,Wallet} from 'lucide-react';
import api from '../services/api';

const radiusOptions=[
  {label:'All nearby',value:'all'},
  {label:'Within 10 km',value:'10'},
  {label:'Within 25 km',value:'25'},
  {label:'Within 50 km',value:'50'},
  {label:'Within 100 km',value:'100'},
  {label:'Regional day trips',value:'200'}
];

export default function DestinationDetails(){
 const {id}=useParams();
 const [d,setD]=useState(null); const [places,setPlaces]=useState([]); const [loading,setLoading]=useState(true); const [placeLoading,setPlaceLoading]=useState(true);
 const [radius,setRadius]=useState('all'); const [q,setQ]=useState('');
 useEffect(()=>{
   setLoading(true); setPlaceLoading(true);
   Promise.all([api.get(`/destinations/${id}`),api.get(`/attractions/destination/${id}`)])
     .then(([dr,pr])=>{setD(dr.data);setPlaces(pr.data||[])})
     .finally(()=>{setLoading(false);setPlaceLoading(false)})
 },[id]);
 const filtered=useMemo(()=>places.filter(p=>{
   const radiusOk=radius==='all'||(radius==='200'?p.distanceKm<=200:p.distanceKm<=Number(radius));
   const text=(p.name+' '+p.category+' '+p.bestFor+' '+p.description).toLowerCase();
   return radiusOk && (!q.trim()||text.includes(q.toLowerCase().trim()));
 }),[places,radius,q]);
 if(loading)return <section className="page"><div className="skeleton hero-detail-skeleton"/></section>;
 if(!d)return <section className="page"><div className="empty"><h3>Destination not found</h3><Link className="btn" to="/destinations">Back to destinations</Link></div></section>;
 return <section className="page detail-page">
   <Link className="back-link" to="/destinations"><ArrowLeft size={17}/> Back to destinations</Link>
   <div className="detail-hero"><img src={d.imageUrl} onError={e=>e.currentTarget.src='/destination-fallback.svg'} /><div className="detail-overlay"><span className="tag light">{d.type}</span><h1>{d.name}</h1><p><MapPin size={16}/> {d.location}</p></div></div>
   <div className="detail-layout">
    <main>
      <div className="panel intro-panel"><span className="eyebrow">DESTINATION GUIDE</span><h2>Plan the whole area, not just the landmark</h2><p>{d.description}</p><div className="detail-stat-grid"><div><Clock3/><b>{d.recommendedDays} days</b><span>Recommended stay</span></div><div><Wallet/><b>₹{Number(d.averageBudget).toLocaleString()}</b><span>Average trip budget</span></div><div><CalendarDays/><b>{d.bestTime}</b><span>Best time to visit</span></div><div><Plane/><b>{d.travelFromHyderabad}</b><span>Travel from Hyderabad</span></div></div></div>
      <div className="panel"><div className="section-heading-row"><div><h3>Top experiences</h3><p className="muted">Start with the essentials, then explore the surrounding area below.</p></div></div><div className="highlight-list">{(d.highlights||'').split(';').map((x,i)=><div key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{x.trim()}</p></div>)}</div></div>
      <div className="panel places-panel">
        <div className="places-heading"><div><span className="eyebrow">LOCAL DISCOVERY</span><h3>Places in and around {d.name}</h3><p className="muted">{places.length} curated places across the destination and its surrounding travel region — including lesser-known stops, villages, nature spots, viewpoints, markets and day-trip options.</p></div><span className="place-count">{places.length} places</span></div>
        <div className="places-tools"><div className="search place-search"><Search size={16}/><input placeholder="Search places, activities or interests..." value={q} onChange={e=>setQ(e.target.value)}/></div><div className="radius-pills">{radiusOptions.map(x=><button key={x.value} className={radius===x.value?'active':''} onClick={()=>setRadius(x.value)}>{x.label}</button>)}</div></div>
        {placeLoading?<div className="nearby-grid">{[1,2,3,4].map(x=><div className="place-skeleton" key={x}/>)}</div>:filtered.length?<div className="nearby-grid">{filtered.map((p,i)=><article className="place-card" key={p.id}><div className="place-image-wrap"><img src={p.imageUrl} loading="lazy" onError={e=>e.currentTarget.src='/destination-fallback.svg'}/><span className="place-distance"><Navigation size={12}/> {p.distanceKm<1?'Nearby':`${p.distanceKm} km`}</span></div><div className="place-body"><div className="place-card-top"><span className="tag">{p.category}</span><span className="place-number">#{String(i+1).padStart(2,'0')}</span></div><h4>{p.name}</h4><p>{p.description}</p><div className="place-meta"><span><Clock3 size={13}/> {p.visitDuration}</span><span><Navigation size={13}/> ~{p.estimatedMinutes} min</span></div><div className="place-best"><b>Good for</b><span>{p.bestFor}</span></div><a className="map-link" href={p.mapUrl} target="_blank" rel="noreferrer">Open map <ExternalLink size={13}/></a></div></article>)}</div>:<div className="empty compact"><h3>No matching places</h3><p>Try a larger radius or a different search.</p></div>}
      </div>
      <div className="panel"><h3>Who will enjoy it?</h3><p>{d.idealFor}</p><div className="chips">{(d.interests||'').split(',').map((x,i)=><span className="chip" key={i}>{x.trim()}</span>)}</div></div>
    </main>
    <aside className="booking-card"><span className="eyebrow">PLAN YOUR JOURNEY</span><h3>{d.name} trip planner</h3><p>Build a complete itinerary with dates, transport, stay, food preferences, activities and budget.</p><div className="mini-meta"><span><Users/> Flexible group size</span><span><Heart/> {places.length} places to explore</span><span><Wallet/> Starting around ₹{Number(d.averageBudget).toLocaleString()}</span></div><Link className="btn full" to={`/plan?destination=${encodeURIComponent(d.name)}`}>Create itinerary</Link></aside>
   </div>
 </section>
}
