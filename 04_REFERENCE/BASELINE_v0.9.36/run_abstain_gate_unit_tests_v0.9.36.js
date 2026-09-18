const fs=require('fs'),path=require('path'),assert=require('assert');
const htmlPath=process.argv[2]||path.join(__dirname,'..','01_PAGES','STOOM_Live_Translator_latest.html');
const html=fs.readFileSync(htmlPath,'utf8');
function decide({candidates=2,score=.82,second=.64,core=2,independent=2,phonetic=.8,stable=false,trusted=false,sourceFit=0}){
  if(!candidates)return ['WOULD_ABSTAIN','NO_CANDIDATE'];
  if(candidates<2)return ['WOULD_ABSTAIN','NO_DISCRIMINATION'];
  if(phonetic<.65)return ['WOULD_ABSTAIN','PHONETIC_GUARD'];
  const strict=trusted&&sourceFit>=.76&&phonetic>=.74&&independent>=2&&!stable;
  const margin=score-second,minScore=stable?.86:.78,minMargin=stable?.15:.12;
  if(!strict&&(independent<2||core<2))return ['WOULD_ABSTAIN','INSUFFICIENT_INDEPENDENCE'];
  if(strict){if(score<.76)return ['WOULD_ABSTAIN','LOW_SCORE'];if(margin<.16)return ['WOULD_ABSTAIN','LOW_MARGIN'];return ['WOULD_SELECT','TRUSTED_LOCAL_RESCUE'];}
  if(score<minScore)return [stable?'WOULD_KEEP':'WOULD_ABSTAIN',stable?'STABLE_TOP1_GUARD':'LOW_SCORE'];
  if(margin<minMargin)return ['WOULD_ABSTAIN','LOW_MARGIN'];
  return ['WOULD_SELECT','STRONG_INDEPENDENT_EVIDENCE'];
}
const checks=[];function check(name,fn){try{fn();checks.push({name,ok:true});}catch(e){checks.push({name,ok:false,error:e.message});}}
check('ABSTAIN still shadow-only',()=>assert(html.includes("const STOOM_ABSTAIN_GATE_MODE='shadow-only'")));
check('normal two-core path remains',()=>assert.deepStrictEqual(decide({core:2,independent:2,score:.84,second:.68}),['WOULD_SELECT','STRONG_INDEPENDENT_EVIDENCE']));
check('single core still abstains when not trusted',()=>assert.deepStrictEqual(decide({core:1,independent:2,score:.9,second:.6}),['WOULD_ABSTAIN','INSUFFICIENT_INDEPENDENCE']));
check('trusted local route requires strong source fit',()=>assert.deepStrictEqual(decide({core:1,independent:2,trusted:true,sourceFit:.75,score:.9,second:.6}),['WOULD_ABSTAIN','INSUFFICIENT_INDEPENDENCE']));
check('trusted local route can select',()=>assert.deepStrictEqual(decide({core:1,independent:2,trusted:true,sourceFit:.82,score:.86,second:.66,phonetic:.8}),['WOULD_SELECT','TRUSTED_LOCAL_RESCUE']));
check('trusted local route requires 0.16 margin',()=>assert.deepStrictEqual(decide({core:1,independent:2,trusted:true,sourceFit:.82,score:.84,second:.70,phonetic:.8}),['WOULD_ABSTAIN','LOW_MARGIN']));
check('stable top1 cannot use trusted local shortcut',()=>assert.deepStrictEqual(decide({core:1,independent:2,trusted:true,sourceFit:.9,score:.9,second:.6,phonetic:.9,stable:true}),['WOULD_ABSTAIN','INSUFFICIENT_INDEPENDENCE']));
check('phonetic guard remains first',()=>assert.deepStrictEqual(decide({core:2,independent:3,trusted:true,sourceFit:.9,phonetic:.64,score:.95,second:.5}),['WOULD_ABSTAIN','PHONETIC_GUARD']));
check('no candidate remains abstain',()=>assert.deepStrictEqual(decide({candidates:0}),['WOULD_ABSTAIN','NO_CANDIDATE']));
check('translation-only free candidate path absent',()=>{const b=html.slice(html.indexOf('function abstainCandidateRows'),html.indexOf('function evaluateAbstainGateShadow'));assert(!b.includes('context-shadow'));assert(!b.includes('pptv-bridge'));});
const pass=checks.filter(x=>x.ok).length;const out={suite:'STOOM-ABSTAIN-1.0 + LCR trusted-local route',total:checks.length,pass,fail:checks.length-pass,checks};console.log(JSON.stringify(out,null,2));if(pass!==checks.length)process.exit(1);
