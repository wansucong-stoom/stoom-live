const fs=require('fs');
const path=require('path');
const assert=require('assert');
const htmlPath=process.argv[2]||path.join(__dirname,'..','01_PAGES','STOOM_Live_Translator_latest.html');
const html=fs.readFileSync(htmlPath,'utf8');

function constant(name){
  const m=html.match(new RegExp(`const\\s+${name}\\s*=\\s*([0-9.]+)`));
  assert(m,`missing ${name}`);return Number(m[1]);
}
function watchdogWouldRestart({burstAge,chromeSpeechActive,hasAnyResult,voiceFrames=10,lastVoiceAgo=0,warmupAge=10000}){
  const stall=constant('STT_WATCHDOG_STALL_MS');
  const initial=constant('STT_WATCHDOG_INITIAL_STALL_MS');
  const acoustic=constant('STT_WATCHDOG_ACOUSTIC_ONLY_STALL_MS');
  const minFrames=constant('STT_WATCHDOG_MIN_VOICE_FRAMES');
  const recent=constant('STT_WATCHDOG_RECENT_VOICE_MS');
  if(voiceFrames<minFrames||lastVoiceAgo>recent)return false;
  const threshold=chromeSpeechActive?(hasAnyResult?stall:initial):acoustic;
  if(burstAge<threshold)return false;
  if(!hasAnyResult&&warmupAge<initial)return false;
  return true;
}
function shouldWaitInterim({pendingAge,browserSpeechActive,textAge}){
  const max=constant('INTERIM_ONLY_FINAL_WAIT_MS');
  const stable=constant('INTERIM_ONLY_STABLE_WAIT_MS');
  if(pendingAge>=max)return false;
  if(browserSpeechActive)return true;
  return textAge<stable;
}
function shouldGuardPersonalOverride({reference,top,topInterim=1,termHint=0,confusion=.151,personalStrong=true,vectorMargin=.0331}){
  const stableTop1Lock=!!reference&&reference===top&&topInterim>=.995&&termHint<.65&&confusion<.75;
  return stableTop1Lock&&personalStrong&&vectorMargin<.08;
}
function sameRecognitionOwner(a,b){
  return a.generation===b.generation&&a.eventResultIndex===b.eventResultIndex;
}

const checks=[];
function check(name,fn){try{fn();checks.push({name,ok:true});}catch(e){checks.push({name,ok:false,error:e.message});}}

check('version 0.9.35',()=>assert(/"version": "0\.9\.35"/.test(html)&&/const APP_VERSION = '0\.9\.35'/.test(html)));
check('inline JS parses',()=>{const blocks=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(x=>x.trim());assert(blocks.length,'inline script not found');for(const block of blocks)new Function(block);});
check('old acoustic-only 1.976s false restart is suppressed',()=>assert.strictEqual(watchdogWouldRestart({burstAge:1976,chromeSpeechActive:false,hasAnyResult:false,voiceFrames:3}),false));
check('old Chrome-speech 3.060s false restart is suppressed',()=>assert.strictEqual(watchdogWouldRestart({burstAge:3060,chromeSpeechActive:true,hasAnyResult:false,voiceFrames:10}),false));
check('old Chrome-speech 2.880s false restart is suppressed',()=>assert.strictEqual(watchdogWouldRestart({burstAge:2880,chromeSpeechActive:true,hasAnyResult:false,voiceFrames:11}),false));
check('real post-result 4.3s stall can still recover',()=>assert.strictEqual(watchdogWouldRestart({burstAge:4300,chromeSpeechActive:true,hasAnyResult:true,voiceFrames:8}),true));
check('growing interim waits for Final',()=>assert.strictEqual(shouldWaitInterim({pendingAge:900,browserSpeechActive:true,textAge:100}),true));
check('interim fallback eventually commits',()=>assert.strictEqual(shouldWaitInterim({pendingAge:2700,browserSpeechActive:true,textAge:100}),false));
check('same recognition result owns one card',()=>assert.strictEqual(sameRecognitionOwner({generation:4,eventResultIndex:2},{generation:4,eventResultIndex:2}),true));
check('different recognition result stays separate',()=>assert.strictEqual(sameRecognitionOwner({generation:4,eventResultIndex:2},{generation:4,eventResultIndex:3}),false));
check('stable top1 blocks weak personal-only reversal',()=>assert.strictEqual(shouldGuardPersonalOverride({reference:'마지막에 결과를 정리하겠습니다',top:'마지막에 결과를 정리하겠습니다'}),true));
check('independent term evidence can bypass personal-only guard',()=>assert.strictEqual(shouldGuardPersonalOverride({reference:'A',top:'A',termHint:.8}),false));
check('required runtime hooks present',()=>{
  for(const token of ['interim_only.commit_deferred','interim_only.reentry_resumed','merge.recognition_owned','speaker.text_continuity_hold','stable-top1-personal-margin-guard'])assert(html.includes(token),`missing ${token}`);
});

const pass=checks.filter(x=>x.ok).length;
const out={suite:'STOOM v0.9.35 ABSTAIN Shadow Candidate · v0.9.33 Stability Freeze',total:checks.length,pass,fail:checks.length-pass,checks};
console.log(JSON.stringify(out,null,2));
if(pass!==checks.length)process.exit(1);
