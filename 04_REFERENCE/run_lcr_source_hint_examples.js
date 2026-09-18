const assert=require('assert');
const KO_CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const KO_JUNG='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
const KO_JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function decompose(text=''){const out=[];for(const ch of String(text)){const code=ch.charCodeAt(0);if(code>=0xAC00&&code<=0xD7A3){const n=code-0xAC00,cho=Math.floor(n/588),jung=Math.floor((n%588)/28),jong=n%28;out.push(KO_CHO[cho],KO_JUNG[jung]);if(KO_JONG[jong])out.push(KO_JONG[jong]);}else if(/[ㄱ-ㅎㅏ-ㅣa-z0-9]/i.test(ch))out.push(ch.toLowerCase());}return out.join('');}
function lev(a,b){const prev=Array.from({length:b.length+1},(_,i)=>i),cur=new Array(b.length+1);for(let i=1;i<=a.length;i++){cur[0]=i;for(let j=1;j<=b.length;j++)cur[j]=a[i-1]===b[j-1]?prev[j-1]:Math.min(prev[j-1],prev[j],cur[j-1])+1;for(let j=0;j<=b.length;j++)prev[j]=cur[j];}return prev[b.length];}
function sim(a,b){const x=decompose(a),y=decompose(b);return 1-lev(x,y)/Math.max(x.length,y.length,1);}
const rows=[
 {observed:'프로젝트 페이스트 러닝',canonical:'프로젝트 베이스드 러닝',expect:'STRONG_SOURCE_HINT',test:x=>x>=.78},
 {observed:'포메이트 프로세스먼트',canonical:'포메이티브 어세스먼트',expect:'STRONG_SOURCE_HINT',test:x=>x>=.78},
 {observed:'껄떡대리점',canonical:'컨스트럭티비즘',expect:'ABSTAIN_SOURCE_HINT',test:x=>x<.76},
 {observed:'비교해',canonical:'브라이트',expect:'REJECT_UNRELATED',test:x=>x<.42}
];
const results=rows.map(r=>{const score=sim(r.observed,r.canonical);return {...r,score:Number(score.toFixed(4)),ok:r.test(score)};});
const pass=results.filter(x=>x.ok).length;console.log(JSON.stringify({suite:'LCR source-hint synthetic examples',thresholds:{retriever:.42,trustedLocal:.76,translationRescue:.78},total:results.length,pass,fail:results.length-pass,results},null,2));if(pass!==results.length)process.exit(1);
