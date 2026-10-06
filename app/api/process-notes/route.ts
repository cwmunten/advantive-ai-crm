import {NextResponse} from 'next/server';

export async function POST(req:Request){
  try{
    const {customer,date,attendees,title,rawText}=await req.json();
    if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'OPENAI_API_KEY ontbreekt op de server.'},{status:503});
    if(!rawText?.trim())return NextResponse.json({error:'Geen notities ontvangen.'},{status:400});
    const prompt=`Maak van onderstaande ruwe Nederlandse gespreksnotities professionele, zakelijke notulen. Verzin niets. Geef uitsluitend geldige JSON zonder markdown met exact deze structuur:
{"title":"korte duidelijke titel","summary":"managementsamenvatting","topics":["onderwerp"],"decisions":["besluit of afspraak"],"report":"volledig goed leesbaar verslag in alinea's","actions":[{"title":"concrete actie","owner":"naam indien bekend, anders leeg","due":"YYYY-MM-DD indien expliciet bekend, anders leeg","remarks":"context"}]}
Klant: ${customer}
Datum: ${date}
Gesprekspartners: ${attendees}
Onderwerp: ${title}
Ruwe notities:
${rawText}`;
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:'gpt-6-luna',input:prompt,store:false})});
    const data=await r.json();
    if(!r.ok)return NextResponse.json({error:data?.error?.message||'AI-verwerking mislukt.'},{status:r.status});
    const text=data.output?.flatMap((x:any)=>x.content||[]).find((x:any)=>x.type==='output_text')?.text||'';
    const cleaned=text.replace(/^\`\`\`json\s*/,'').replace(/\`\`\`$/,'').trim();
    return NextResponse.json(JSON.parse(cleaned));
  }catch(e:any){return NextResponse.json({error:e?.message||'Onbekende fout.'},{status:500})}
}
