const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const basePath=process.argv[2]; const newPath=process.argv[3];
if(!basePath||!newPath)throw new Error('usage: node run_protected_path_regression.js BASE NEW');
const base=fs.readFileSync(basePath,'utf8'),cur=fs.readFileSync(newPath,'utf8');
function extractFunction(src,name){
  const re=new RegExp(`function\\s+${name}\\s*\\(`);const m=re.exec(src);assert(m,`missing ${name}`);
  const start=m.index, brace=src.indexOf('{',m.index+m[0].length);let depth=0,quote='',esc=false;
  for(let i=brace;i<src.length;i++){
    const c=src[i];
    if(quote){if(esc)esc=false;else if(c==='\\\\')esc=true;else if(c===quote)quote='';continue;}
    if(c==='\''||c==='"'||c==='`'){quote=c;continue;}
    if(c==='{')depth++; else if(c==='}'&&--depth===0)return src.slice(start,i+1);
  }
  throw new Error(`unclosed ${name}`);
}
function hash(x){return crypto.createHash('sha256').update(x).digest('hex');}
const protectedFns=['mainSpeakerFinalDisposition','flushSentenceBuffer','evaluateContinuousSentenceBoundary','maybeEnforceContinuousSentenceLatency','attachLateFinalToRecentCard','attachOrphanLateFinal','recognitionConfidenceRoute','selectContextualNBest'];
const protectedConsts=['STT_WATCHDOG_STALL_MS','STT_WATCHDOG_INITIAL_STALL_MS','STT_WATCHDOG_ACOUSTIC_ONLY_STALL_MS','STT_WATCHDOG_MIN_VOICE_FRAMES','STT_WATCHDOG_RECENT_VOICE_MS','STT_WATCHDOG_RESTART_COOLDOWN_MS','STT_WATCHDOG_START_TIMEOUT_MS','INTERIM_ONLY_FINAL_WAIT_MS','INTERIM_ONLY_STABLE_WAIT_MS','INTERIM_REENTRY_RESUME_MS'];
const checks=[];for(const n of protectedFns){const a=extractFunction(base,n),b=extractFunction(cur,n);checks.push({name:n,ok:a===b,base:hash(a),current:hash(b)});}
for(const n of protectedConsts){const re=new RegExp(`const\\s+${n}\\s*=\\s*([^;]+);`);const a=(base.match(re)||[])[1],b=(cur.match(re)||[])[1];checks.push({name:n,ok:a===b,base:a,current:b});}
const pass=checks.filter(x=>x.ok).length;const out={suite:'v0.9.33 Protected Runtime Path Freeze',total:checks.length,pass,fail:checks.length-pass,checks};console.log(JSON.stringify(out,null,2));if(pass!==checks.length)process.exit(1);
