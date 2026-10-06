import {NextResponse} from 'next/server';

export async function POST(req:Request){
  try{
    const {customer,date,attendees,title,rawText}=await req.json();
    if(!rawText?.trim()) return NextResponse.json({error:'Geen notities ontvangen.'},{status:400});
    if(!process.env.OPENAI_API_KEY) return NextResponse.json({error:'OPENAI_API_KEY ontbreekt op de server.'},{status:503});

    const prompt=`Je bent een ervaren Nederlandse notulist en taalredacteur.
Zet onderstaande ruwe, getypte of via spraakherkenning verkregen gespreksnotities om in professionele Nederlandse notulen.

Belangrijke regels:
- Corrigeer spelling, grammatica, interpunctie, woordvolgorde en herkenbare fouten uit spraakherkenning.
- Verwijder stopwoorden, herhalingen, versprekingen en overbodige spreektaal.
- Herschrijf naar natuurlijk, zakelijk en prettig leesbaar Nederlands.
- Behoud ALLE inhoudelijke feiten, namen, bedragen, data, afspraken en nuances.
- Verzin nooit informatie die niet in de bron staat.
- Maak geen actiepunt van een algemene bespreking. Neem alleen concrete acties/toezeggingen/vervolgstappen op.
- Vul eigenaar en deadline alleen in wanneer die uit de bron blijken; anders een lege string.
- Schrijf het volledige verslag in duidelijke alinea's, niet als transcript.
- De managementsamenvatting is compact maar inhoudelijk.
- Formuleer onderwerpen kort.
- Besluiten en afspraken moeten concreet zijn.
- Geef uitsluitend geldige JSON terug, zonder markdown.

Klant: ${customer||''}
Datum: ${date||''}
Aanwezigen: ${attendees||''}
Werktitel: ${title||''}

Ruwe notities:
${rawText}

JSON:
{
 "title":"korte professionele titel",
 "summary":"compacte managementsamenvatting",
 "topics":["kort onderwerp"],
 "decisions":["concreet besluit of afspraak"],
 "report":"volledig gecorrigeerd en professioneel verslag in alinea's",
 "actions":[{"title":"concrete actie","owner":"","due":"","remarks":"korte relevante context"}]
}`;

    const response=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:'gpt-6-luna',input:prompt,store:false})
    });
    const data=await response.json();
    if(!response.ok) return NextResponse.json({error:data?.error?.message||'AI-verwerking mislukt.'},{status:response.status});
    const text=data.output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.type==='output_text')?.text;
    if(!text) return NextResponse.json({error:'Geen bruikbaar AI-resultaat ontvangen.'},{status:502});
    const cleaned=text.replace(/^\s*```(?:json)?/i,'').replace(/```\s*$/,'').trim();
    try{return NextResponse.json(JSON.parse(cleaned));}
    catch{return NextResponse.json({error:'Het AI-resultaat kon niet als notulen worden verwerkt.'},{status:502});}
  }catch(e:any){
    return NextResponse.json({error:e?.message||'Verwerking mislukt.'},{status:500});
  }
}
