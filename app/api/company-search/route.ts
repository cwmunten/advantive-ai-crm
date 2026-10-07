import {NextRequest,NextResponse} from 'next/server';

export async function GET(req:NextRequest){
  const q=(req.nextUrl.searchParams.get('q')||'').trim();
  if(q.length<2)return NextResponse.json({error:'Vul minimaal 2 tekens in.'},{status:400});
  const params=new URLSearchParams({q:q+', Nederland',format:'jsonv2',countrycodes:'nl',addressdetails:'1',extratags:'1',namedetails:'1',limit:'8'});
  try{
    const r=await fetch('https://nominatim.openstreetmap.org/search?'+params.toString(),{
      headers:{'User-Agent':'Advantive-AI-CRM/1.0','Accept':'application/json','Accept-Language':'nl-NL,nl;q=0.9'},
      cache:'no-store'
    });
    if(!r.ok)throw new Error('De openbare bedrijfsbron is tijdelijk niet beschikbaar.');
    const type=r.headers.get('content-type')||'';
    if(!type.includes('json'))throw new Error('De openbare bedrijfsbron gaf een ongeldig antwoord.');
    const data:any[]=await r.json();
    if(!Array.isArray(data))throw new Error('De openbare bedrijfsbron gaf een ongeldig antwoord.');
    const results=data.map(x=>{
      const a=x.address||{},e=x.extratags||{},n=x.namedetails||{};
      const road=a.road||a.pedestrian||a.residential||a.footway||'';
      const house=a.house_number||'';
      const city=a.city||a.town||a.village||a.municipality||'';
      return {
        name:n.name||a.company||a.office||a.shop||x.name||String(x.display_name||'').split(',')[0],
        address:[road,house].filter(Boolean).join(' '),
        postcode:a.postcode||'',
        city,
        phone:e.phone||e['contact:phone']||'',
        website:e.website||e['contact:website']||e.url||'',
        displayName:x.display_name||''
      }
    }).filter(x=>x.name);
    return NextResponse.json({results});
  }catch(e:any){return NextResponse.json({error:e.message||'Zoeken mislukt'},{status:502})}
}
