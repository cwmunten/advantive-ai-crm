import {NextResponse} from 'next/server';

const clean=(s:string)=>s.replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim();
const cap=(s:string)=>s? s.charAt(0).toUpperCase()+s.slice(1):s;
const correct=(input:string)=>{
  let s=clean(input)
    .replace(/\b(uh+|eh+|euh+|hmm+)\b[,.]?\s*/gi,'')
    .replace(/\bzeg maar\b[,.]?\s*/gi,'')
    .replace(/\bweet je\b[,.]?\s*/gi,'')
    .replace(/\bals het ware\b[,.]?\s*/gi,'')
    .replace(/\b(is besproken geworden)\b/gi,'is besproken')
    .replace(/\b(hun hebben)\b/gi,'zij hebben')
    .replace(/\b(me collega)\b/gi,'mijn collega')
    .replace(/\b(na aanleiding van)\b/gi,'naar aanleiding van')
    .replace(/\b(ten alle tijden)\b/gi,'te allen tijde')
    .replace(/\b(sowieso|zoiezo|zowiezo)\b/gi,'sowieso')
    .replace(/\bgebeurdt\b/gi,'gebeurt')
    .replace(/\bbedoeldt\b/gi,'bedoelt')
    .replace(/\bwordt besproken hebben\b/gi,'hebben besproken')
    .replace(/\bwe hebben afgesproken dat we gaan\b/gi,'Afgesproken is dat we')
    .replace(/\bwe hebben besproken dat\b/gi,'Besproken is dat')
    .replace(/\bwe hebben besloten dat\b/gi,'Besloten is dat')
    .replace(/\bwe zijn overeengekomen dat\b/gi,'Overeengekomen is dat')
    .replace(/\s{2,}/g,' ');
  s=cap(s.trim());
  if(s&&!/[.!?]$/.test(s))s+='.';
  return s;
};
const sentenceParts=(s:string)=>s.replace(/\n+/g,'. ').split(/(?<=[.!?])\s+|;\s+|\s+-\s+/).map(correct).filter(x=>x.length>1);
const uniq=(a:string[])=>[...new Set(a.map(clean).filter(Boolean))];

export async function POST(req:Request){
 try{
  const {title,rawText}=await req.json();
  if(!rawText?.trim())return NextResponse.json({error:'Geen notities ontvangen.'},{status:400});
  const ss=sentenceParts(rawText);
  const actionRx=/\b(actie|actiepunt|afspraak|moet|moeten|zal|zullen|sturen|delen|inplannen|plannen|regelen|uitzoeken|opleveren|opvolgen|terugkoppelen|contact opnemen|voorstel|offerte)\b/i;
  const decisionRx=/\b(afgesproken|besloten|besluit|akkoord|overeengekomen|besproken is dat|besloten is dat|afgesproken is dat)\b/i;
  const actions=uniq(ss.filter(x=>actionRx.test(x))).slice(0,12).map(x=>({title:cap(x.replace(/^(actiepunt|actie|afspraak)\s*[:\-]?\s*/i,'').replace(/[.!]$/,'')),owner:'',due:'',remarks:'Automatisch herkend uit de gespreksnotities. Controleer dit actiepunt voor opslaan.'}));
  const decisions=uniq(ss.filter(x=>decisionRx.test(x))).slice(0,10);
  const body=ss.filter(x=>!actionRx.test(x)||decisionRx.test(x));
  const topics=uniq(body.slice(0,6).map(x=>x.length>125?x.slice(0,122).replace(/[,;:]?\s+\S*$/,'')+'…':x));
  const summarySource=body.length?body:ss;
  const summary=summarySource.slice(0,Math.min(3,summarySource.length)).join(' ');
  const paras:string[]=[];for(let i=0;i<ss.length;i+=3)paras.push(ss.slice(i,i+3).join(' '));
  return NextResponse.json({title:correct(title||'Gespreksverslag').replace(/[.]$/,''),summary:correct(summary),topics:topics.length?topics:['Algemene bespreking.'],decisions,report:paras.join('\n\n'),actions});
 }catch(e:any){return NextResponse.json({error:e?.message||'Verwerking mislukt.'},{status:500})}
}