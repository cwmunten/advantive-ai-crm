import {NextResponse} from 'next/server';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const headers={'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'};

async function req(path:string,init?:RequestInit){
 const r=await fetch(url+'/rest/v1/'+path,{...init,headers:{...headers,...(init?.headers||{})},cache:'no-store'});
 if(!r.ok) throw new Error(await r.text());
 const text=await r.text(); return text?JSON.parse(text):null;
}
export async function GET(){
 try{
  const [cs,cts,ns,ts]=await Promise.all([
   req('crm_customers?select=*&order=id.desc'),
   req('crm_contacts?select=*&order=id.asc'),
   req('crm_notes?select=*&order=id.desc'),
   req('crm_tasks?select=*&order=id.desc')
  ]);
  const customers=cs.map((c:any)=>({id:c.id,name:c.name,address:c.address||'',postcode:c.postcode||'',city:c.city||'',phone:c.phone||'',email:c.email||'',website:c.website||'',contact:c.contact||'',role:c.role||'',contactEmail:c.contact_email||'',contactPhone:c.contact_phone||'',remarks:c.remarks||'',contacts:cts.filter((x:any)=>x.customer_id===c.id).map((x:any)=>({id:x.id,name:x.name,role:x.role||'',email:x.email||'',phone:x.phone||'',primary:x.is_primary}))}));
  const notes=ns.map((n:any)=>({id:n.id,customer:n.customer_name||'',title:n.title,date:n.note_date||'',summary:n.summary||'',actions:n.actions_count||0,attendees:n.attendees||'',rawText:n.raw_text||''}));
  const tasks=ts.map((t:any)=>({id:t.id,title:t.title,customer:t.customer_name||'',due:t.due||'',status:t.status,priority:t.priority,created:t.task_created||'',remarks:t.remarks||''}));
  return NextResponse.json({customers,notes,tasks});
 }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
export async function POST(request:Request){
 try{
  const {entity,data}=await request.json();
  const table:any={customer:'crm_customers',contact:'crm_contacts',note:'crm_notes',task:'crm_tasks'}[entity];
  if(!table) return NextResponse.json({error:'Onbekend type'},{status:400});
  const r=await req(table,{method:'POST',headers:{'Prefer':'return=representation'},body:JSON.stringify(data)});
  return NextResponse.json(r?.[0]||r);
 }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
export async function PATCH(request:Request){
 try{
  const {entity,id,data}=await request.json();
  const table:any={customer:'crm_customers',contact:'crm_contacts',note:'crm_notes',task:'crm_tasks'}[entity];
  const r=await req(table+'?id=eq.'+id,{method:'PATCH',headers:{'Prefer':'return=representation'},body:JSON.stringify(data)});
  return NextResponse.json(r?.[0]||r);
 }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
export async function DELETE(request:Request){
 try{
  const {entity,id}=await request.json();
  const table:any={customer:'crm_customers',contact:'crm_contacts',note:'crm_notes',task:'crm_tasks'}[entity];
  await req(table+'?id=eq.'+id,{method:'DELETE'});
  return NextResponse.json({ok:true});
 }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}