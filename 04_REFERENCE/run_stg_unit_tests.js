const assert = require('assert');
function clamp(v,min=0,max=1){v=Number(v);return Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;}
function lev(a='',b=''){
  a=String(a); b=String(b); const n=b.length;
  let prev=Array.from({length:n+1},(_,i)=>i), cur=new Array(n+1);
  for(let i=1;i<=a.length;i++){
    cur[0]=i;
    for(let j=1;j<=n;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
    [prev,cur]=[cur,prev];
  }
  return prev[n];
}
const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const JUNG='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
const JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function decompose(text=''){
  const out=[];
  for(const ch of String(text)){
    const c=ch.charCodeAt(0);
    if(c>=0xAC00&&c<=0xD7A3){const n=c-0xAC00,cho=Math.floor(n/588),jung=Math.floor((n%588)/28),jong=n%28;out.push(CHO[cho],JUNG[jung]);if(JONG[jong])out.push(JONG[jong]);}
    else out.push(ch);
  }
  return out.join('');
}
function coarseKey(text='',lang='en'){
  const out=[], push=x=>{if(x&&out[out.length-1]!==x)out.push(x);};
  if(lang==='en'){
    const x=String(text).normalize('NFKC').toLowerCase().replace(/[^a-z]/g,'');
    for(let i=0;i<x.length;){const two=x.slice(i,i+2);let c='';
      if(two==='th'){c='T';i+=2;} else if(two==='sh'||two==='ch'){c='S';i+=2;} else if(two==='ph'){c='P';i+=2;} else if(two==='ng'){c='N';i+=2;} else if(two==='wh'){c='W';i+=2;} else if(two==='ck'||two==='qu'){c='K';i+=2;}
      else {const ch=x[i++];if('aeiouy'.includes(ch))c='V';else if('bpfv'.includes(ch))c='P';else if('rl'.includes(ch))c='R';else if('td'.includes(ch))c='T';else if('kgqc'.includes(ch))c='K';else if('szxj'.includes(ch))c='S';else if('mn'.includes(ch))c='N';else if(ch==='h')c='H';else if(ch==='w')c='W';}
      push(c);
    }
  }else{
    for(const ch of decompose(text)){let c='';if(/[ㅏ-ㅣ]/.test(ch))c='V';else if('ㅂㅃㅍ'.includes(ch))c='P';else if(ch==='ㅁ')c='N';else if(ch==='ㄹ')c='R';else if('ㄷㄸㅌ'.includes(ch))c='T';else if('ㄱㄲㅋ'.includes(ch))c='K';else if('ㅅㅆㅈㅉㅊ'.includes(ch))c='S';else if('ㄴㅇ'.includes(ch))c='N';else if(ch==='ㅎ')c='H';push(c);}
  }
  return out.join('');
}
function detailedKey(text='',lang='en'){
  const out=[],push=x=>{if(x&&out[out.length-1]!==x)out.push(x);};
  const v=v=>{if('ㅏㅑㅘ'.includes(v))return'A';if('ㅐㅒㅔㅖㅙㅚ'.includes(v))return'E';if('ㅓㅕㅗㅛ'.includes(v))return'O';if('ㅜㅠㅝㅞㅟㅡㅢ'.includes(v))return'U';if(v==='ㅣ')return'I';return'';};
  const k=(c,pos='initial')=>{if(pos==='initial'&&c==='ㅇ')return'';if(pos==='final'&&c==='ㅇ')return'N';if('ㅂㅃㅍ'.includes(c))return'P';if('ㅁㄴ'.includes(c))return'N';if(c==='ㄹ')return'R';if('ㄷㄸㅌ'.includes(c))return'T';if('ㄱㄲㅋ'.includes(c))return'K';if('ㅅㅆㅈㅉㅊ'.includes(c))return'S';if(c==='ㅎ')return'H';return'';};
  if(lang==='ko'){
    for(const ch of String(text)){const code=ch.charCodeAt(0);if(code>=0xAC00&&code<=0xD7A3){const n=code-0xAC00,cho=Math.floor(n/588),jung=Math.floor((n%588)/28),jong=n%28;push(k(CHO[cho],'initial'));push(v(JUNG[jung]));if(jong)push(k(JONG[jong],'final'));}}
  }else{
    const x=String(text).normalize('NFKC').toLowerCase().replace(/[^a-z]/g,'');
    for(let i=0;i<x.length;){const two=x.slice(i,i+2);let c='';if(two==='th'){c='T';i+=2;}else if(two==='sh'||two==='ch'){c='S';i+=2;}else if(two==='ph'){c='P';i+=2;}else if(two==='ng'){c='N';i+=2;}else if(two==='wh'){c='W';i+=2;}else if(two==='ck'||two==='qu'){c='K';i+=2;}else{const ch=x[i++];if(ch==='a')c='A';else if(ch==='e')c='E';else if(ch==='i'||ch==='y')c='I';else if(ch==='o')c='O';else if(ch==='u')c='U';else if('bpfv'.includes(ch))c='P';else if('rl'.includes(ch))c='R';else if('td'.includes(ch))c='T';else if('kgqc'.includes(ch))c='K';else if('szxj'.includes(ch))c='S';else if('mn'.includes(ch))c='N';else if(ch==='h')c='H';else if(ch==='w')c='W';}push(c);}
  }
  return out.join('');
}
function simKey(a,b){return a&&b?clamp(1-lev(a,b)/Math.max(a.length,b.length,1)):0;}
function lcs(a='',b=''){let prev=new Uint16Array(b.length+1),cur=new Uint16Array(b.length+1);for(let i=1;i<=a.length;i++){for(let j=1;j<=b.length;j++)cur[j]=a[i-1]===b[j-1]?prev[j-1]+1:Math.max(prev[j],cur[j-1]);[prev,cur]=[cur,prev];cur.fill(0);}return prev[b.length]||0;}
function guard(observed,candidate,{variation=0,boundary=.55}={}){
  const ck=coarseKey(observed,'ko'),ce=coarseKey(candidate,'en'),dk=detailedKey(observed,'ko'),de=detailedKey(candidate,'en');
  const coarse=simKey(ck,ce), detailed=simKey(dk,de), phonetic=.45*coarse+.55*detailed;
  const L=lcs(dk,de),oc=L/Math.max(1,dk.length),cc=L/Math.max(1,de.length),balance=Math.min(dk.length,de.length)/Math.max(dk.length,de.length,1),harm=(oc+cc)?2*oc*cc/(oc+cc):0,coverage=harm*(.82+.18*balance);
  const pattern=.50*detailed+.25*coarse+.25*balance;
  const syllables=(observed.match(/[가-힣]/g)||[]).length,tokens=observed.trim().split(/\s+/).filter(Boolean).length,candidateTokens=candidate.trim().split(/[\s\-]+/).filter(Boolean).length;
  const run=.65*clamp((syllables-2)/6)+.20*clamp((tokens-1)/2)+.15*clamp((candidateTokens-1)/2);
  const nativePenalty=.50*(1-variation)+.30*(1-pattern)+.20*(1-run);
  const score=clamp(.36*phonetic+.24*coverage+.14*variation+.10*pattern+.08*boundary+.08*run-.18*nativePenalty);
  let reason='';if(syllables<=2)reason='short-span';else if(oc<.62||cc<.62)reason='coverage';else if(tokens===1&&syllables<=3&&variation<.12&&pattern<.78)reason='stable-short-native-like';
  const state=reason?'KEEP':score>=.45?'STRONG':score>=.39?'AMBIGUOUS':'KEEP';
  return {state,reason,score:+score.toFixed(4),phonetic:+phonetic.toFixed(4),coverage:+coverage.toFixed(4),run:+run.toFixed(4),syllables};
}
const cases=[
  ['바탕','fading','KEEP'],['패턴','fading','KEEP'],['블룸','bullying','KEEP'],
  ['컨트럭 티비즘','constructivism','STRONG'],['비 헤비어리즘','behaviorism','STRONG'],
  ['러닝셔널리틱스','learning analytics','STRONG'],['프로젝트 베이스','project approach','AMBIGUOUS'],
  ['프로젝트 베이스 러닝','project-based learning','STRONG'],['포맷 디브 에센 멈추','formative assessment','AMBIGUOUS']
];
let pass=0;const results=[];
for(const [observed,candidate,expected] of cases){const r=guard(observed,candidate);const ok=r.state===expected;if(ok)pass++;results.push({observed,candidate,expected,actual:r.state,ok,...r});}
console.log(JSON.stringify({total:cases.length,pass,fail:cases.length-pass,results},null,2));
assert.strictEqual(pass,cases.length);
