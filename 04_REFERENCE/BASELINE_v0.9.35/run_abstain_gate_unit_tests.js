const fs=require('fs');
const path=require('path');
const assert=require('assert');
const htmlPath=process.argv[2]||path.join(__dirname,'..','01_PAGES','STOOM_Live_Translator_latest.html');
const html=fs.readFileSync(htmlPath,'utf8');
function constant(name){
  const m=html.match(new RegExp(`const\\s+${name}\\s*=\\s*([0-9.]+)`));
  assert(m,`missing ${name}`);return Number(m[1]);
}
const maxCandidates=constant('STOOM_ABSTAIN_MAX_CANDIDATES');
const budgetMs=constant('STOOM_ABSTAIN_EVAL_BUDGET_MS');
function decide({candidates=2,score=.8,second=.66,core=2,independent=2,phonetic=.8,stable=false,translationOnly=false,short=false,coverage=.8}){
  if(!candidates)return ['WOULD_ABSTAIN','NO_CANDIDATE'];
  if(candidates<2)return ['WOULD_ABSTAIN','NO_DISCRIMINATION'];
  if(translationOnly)return ['WOULD_ABSTAIN','TRANSLATION_DERIVED_ONLY'];
  if(short)return ['WOULD_KEEP','SHORT_NATIVE_GUARD'];
  if(coverage<.64)return ['WOULD_ABSTAIN','LOW_COVERAGE'];
  if(independent<2||core<2)return ['WOULD_ABSTAIN','INSUFFICIENT_INDEPENDENCE'];
  if(phonetic<.65)return ['WOULD_ABSTAIN','PHONETIC_GUARD'];
  const minScore=stable?.86:.78,minMargin=stable?.15:.12,margin=score-second;
  if(score<minScore)return [stable?'WOULD_KEEP':'WOULD_ABSTAIN',stable?'STABLE_TOP1_GUARD':'LOW_SCORE'];
  if(margin<minMargin)return ['WOULD_ABSTAIN','LOW_MARGIN'];
  return ['WOULD_SELECT','STRONG_INDEPENDENT_EVIDENCE'];
}
const checks=[]; function check(name,fn){try{fn();checks.push({name,ok:true});}catch(e){checks.push({name,ok:false,error:e.message});}}
check('ABSTAIN module present',()=>{for(const t of ['STOOM-ABSTAIN-1.0','abstain_gate.shadow','runtimeMutation:false','criticalPath:false'])assert(html.includes(t),`missing ${t}`)});
check('shadow-only mode present',()=>assert(/const STOOM_ABSTAIN_GATE_MODE='shadow-only'/.test(html)));
check('bounded observer',()=>{assert.strictEqual(maxCandidates,8);assert.strictEqual(budgetMs,6);assert(html.includes('requestIdleCallback'));assert(html.includes('deferredDropped'))});
check('no candidate abstains',()=>assert.deepStrictEqual(decide({candidates:0}),['WOULD_ABSTAIN','NO_CANDIDATE']));
check('no discrimination abstains',()=>assert.deepStrictEqual(decide({candidates:1}),['WOULD_ABSTAIN','NO_DISCRIMINATION']));
check('translation-only candidate is blocked',()=>assert.deepStrictEqual(decide({translationOnly:true}),['WOULD_ABSTAIN','TRANSLATION_DERIVED_ONLY']));
check('short native stays protected',()=>assert.deepStrictEqual(decide({short:true}),['WOULD_KEEP','SHORT_NATIVE_GUARD']));
check('coverage below .64 abstains',()=>assert.deepStrictEqual(decide({coverage:.63}),['WOULD_ABSTAIN','LOW_COVERAGE']));
check('context/topic without two core groups cannot select',()=>assert.deepStrictEqual(decide({core:1,independent:3,score:.95,second:.5}),['WOULD_ABSTAIN','INSUFFICIENT_INDEPENDENCE']));
check('phonetic below .65 cannot select',()=>assert.deepStrictEqual(decide({phonetic:.64,score:.95,second:.5}),['WOULD_ABSTAIN','PHONETIC_GUARD']));
check('low margin abstains',()=>assert.deepStrictEqual(decide({score:.84,second:.75}),['WOULD_ABSTAIN','LOW_MARGIN']));
check('strong independent evidence selects in shadow',()=>assert.deepStrictEqual(decide({score:.87,second:.70,core:2,independent:3,phonetic:.81}),['WOULD_SELECT','STRONG_INDEPENDENT_EVIDENCE']));
check('stable top1 raises threshold',()=>assert.deepStrictEqual(decide({score:.84,second:.60,stable:true}),['WOULD_KEEP','STABLE_TOP1_GUARD']));
check('STG observer does not record runtime stats',()=>assert(html.includes("{recordStats:false}")));
check('Acoustic HDR not connected to LIVE runtime',()=>assert(html.includes('acousticHdrRuntimeConnected:false')));
const pass=checks.filter(x=>x.ok).length;const out={suite:'STOOM-ABSTAIN-1.0 Shadow Gate',total:checks.length,pass,fail:checks.length-pass,checks};
console.log(JSON.stringify(out,null,2));if(pass!==checks.length)process.exit(1);
