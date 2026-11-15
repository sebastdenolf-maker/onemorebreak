const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const source=fs.readFileSync('supabase/functions/welcome-member/index.ts','utf8').replace(/^import .*\n/,'');
async function boot({verified=true,pending=true,providerOK=true,key=true}={}){
 let handler,claims=0,saved=0,sent=0,payload;
 const admin={auth:{getUser:async()=>({data:{user:verified?{id:'user-1',email_confirmed_at:'today'}:null},error:null})},rpc:async()=>{claims++;return{data:pending?[{user_id:'user-1',recipient:'verified@example.org',member_number:100001}]:[],error:null}},from:()=>({update:()=>({eq:()=>({is:async()=>{saved++;return{error:null}}})})})};
 vm.runInNewContext(source,{createClient:()=>admin,Deno:{env:{get:n=>n==='RESEND_API_KEY'&&!key?null:'server-secret'},serve:f=>handler=f},Response,AbortSignal,fetch:async(url,options)=>{sent++;payload=JSON.parse(options.body);return{ok:providerOK,json:async()=>({id:'receipt-1'})}}});
 const call=async({token='valid',body}={})=>handler({method:'POST',headers:new Headers(token?{authorization:'Bearer '+token}:{}),body});
 return{call,stats:()=>({claims,saved,sent,payload})};
}
test('anonymous and unverified requests cannot send',async()=>{for(const setup of [{verified:false},{}]){const app=await boot(setup);assert.equal((await app.call(setup.verified===false?{}:{token:''})).status,401);assert.equal(app.stats().sent,0)}});
test('recipient and number come from protected queue, never request body',async()=>{const app=await boot();assert.equal((await app.call({body:'{"to":"attacker@example.org","member_number":1}'})).status,200);assert.deepEqual(app.stats().payload.to,['verified@example.org']);assert.match(app.stats().payload.text,/#100001/);assert.equal(app.stats().saved,1)});
test('no pending row prevents a repeated welcome',async()=>{const app=await boot({pending:false});assert.equal((await app.call()).status,200);assert.equal(app.stats().sent,0)});
test('failed delivery is never marked sent',async()=>{const app=await boot({providerOK:false});assert.equal((await app.call()).status,502);assert.equal(app.stats().saved,0)});
test('missing mail secret fails safely before claiming an email',async()=>{const app=await boot({key:false});assert.equal((await app.call()).status,503);assert.equal(app.stats().claims,0)});
