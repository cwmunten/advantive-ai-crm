import {NextResponse} from 'next/server';

const clean=(s:string)=>s.replace(/\s+/g,' ').trim();
const sentences=(s:string)=>clean(s).split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean);
const uniq=(a:string[])=>[...new Set(a.map(clean).filter(Boolean))];

export async function POST(req:Request){
  try{
    const {title,rawText}=await req.json();
    if(!rawText?.trim())return NextResponse.json({error:'Geen notities ontvangen.'},{status:400});
    const ss=sentences(rawText);
    const actionRx=/\b(actie|actiepunt|afspraak|moet|moeten|zal|zullen|sturen|delen|inplannen|plannen|regelen|uitzoeken|opleveren|opvolgen|terugkoppelen|contact opnemen|voorstel|offerte)\b/i;
    const decisionRx=/\b(afgesproken|besloten|besluit|akkoord|overeengekomen|we spreken af|gaat|wordt afgesproken)\b/i;
    const actions=uniq(ss.filter(x=>actionRx.test(x))).slice(0,12).map(x=>({title:x.replace(/^(actiepunt|actie|afspraak)\s*[:\-]?\s*/i,'').replace(/[.!]$/,''),owner:'',due:'',remarks:'Automatisch herkend uit de gespreksnotities. Controleer dit actiepunt voor opslaan.'}));
    const decisions=uniq(ss.filter(x=>decisionRx.test(x))).slice(0,10);
    const nonActions=ss.filter(x=>!actionRx.test(x));
    const topics=uniq(nonActions.slice(0,6).map(x=>x.length>110?x.slice(0,107)+'…':x));
    const summary=ss.slice(0,Math.min(3,ss.length)).join(' ');
    const paras:string[]=[]; for(let i=0;i<ss.length;i+=3)paras.push(ss.slice(i,i+3).join(' '));
    return NextResponse.json({
      title:clean(title)||'Gespreksverslag',
      summary:summary||clean(rawText),
      topics:topics.length?topics:['Algemene bespreking'],
      decisions,
      report:paras.join('\n\n'),
      actions
    });
  }catch(e:any){return NextResponse.json({error:e?.message||'Verwerking mislukt.'},{status:500})}
}
