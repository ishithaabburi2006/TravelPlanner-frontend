import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,Clock3,MapPin,Search,SlidersHorizontal,Wallet} from 'lucide-react';
import api from '../services/api';
const types=['ALL','Beach','Mountain','Heritage','Nature','City','Spiritual','Adventure','Coastal','Hill Station','Island','Romantic'];
export default function Destinations(){
 const [q,setQ]=useState(''); const [type,setType]=useState('ALL'); const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
 async function load(){setLoading(true);try{const {data}=await api.get('/destinations',{params:{q,type:type==='ALL'?'':type}});setItems(data)}finally{setLoading(false)}}
 useEffect(()=>{load()},[type]);
 return <section className="page">
  <div className="page-head destinations-head"><div><span className="eyebrow">EXPLORE INDIA</span><h2>Places worth travelling for</h2><p>Discover hand-picked Indian destinations with budgets, ideal trip length, best seasons and travel ideas.</p></div></div>
  <div className="filter-bar"><div className="search"><Search size={18}/><input placeholder="Search by city, state, interest..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}/><button className="search-btn" onClick={load}>Search</button></div><div className="type-filter"><SlidersHorizontal size={16}/><select value={type} onChange={e=>setType(e.target.value)}>{types.map(t=><option key={t} value={t}>{t==='ALL'?'All trip types':t}</option>)}</select></div></div>
  {loading?<div className="grid">{[1,2,3,4,5,6].map(x=><div className="skeleton-card" key={x}/>)}</div>:<div className="grid destination-grid">{items.map(d=><article className="dest-card" key={d.id}><div className="dest-image-wrap"><img src={d.imageUrl} onError={e=>e.currentTarget.src='/destination-fallback.svg'}/><span className="tag overlay-tag">{d.type}</span></div><div className="dest-body"><div className="dest-title"><div><h3>{d.name}</h3><p><MapPin size={14}/> {d.location}</p></div><span className="budget-pill">₹{Number(d.averageBudget).toLocaleString()}</span></div><p className="description">{d.description}</p><div className="dest-meta"><span><Clock3/> {d.recommendedDays} days</span><span><Wallet/> Avg. budget</span></div><div className="card-actions"><Link to={`/destinations/${d.id}`} className="text-link">View guide <ArrowRight size={15}/></Link><Link to={`/plan?destination=${encodeURIComponent(d.name)}`} className="btn small">Plan trip</Link></div></div></article>)}</div>}
  {!loading&&!items.length&&<div className="empty"><h3>No destinations found</h3><p>Try another city, interest or trip type.</p></div>}
 </section>
}
