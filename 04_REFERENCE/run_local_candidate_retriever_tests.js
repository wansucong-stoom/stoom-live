const fs=require('fs'),path=require('path'),assert=require('assert');
const htmlPath=process.argv[2]||path.join(__dirname,'..','01_PAGES','STOOM_Live_Translator_latest.html');
const html=fs.readFileSync(htmlPath,'utf8');
const checks=[];function check(name,fn){try{fn();checks.push({name,ok:true});}catch(e){checks.push({name,ok:false,error:e.message});}}
function block(from,to){const a=html.indexOf(from);assert(a>=0,`missing ${from}`);const b=html.indexOf(to,a);assert(b>a,`missing end ${to}`);return html.slice(a,b);}
check('version 0.9.36',()=>{assert(html.includes('"version": "0.9.36"'));assert(html.includes("const APP_VERSION = '0.9.36'"));});
check('LCR module present',()=>{for(const t of ['STOOM-LCR-1.0','evaluateLocalCandidateRetrieverShadow','local_candidate_retriever.shadow'])assert(html.includes(t),`missing ${t}`);});
check('trusted sources only',()=>{const b=block('function localRetrieverTrustedSource','function localRetrieverPool');for(const t of ["'topic-pack'","'topic-pack-alias'","'glossary-map'","'term-profile'"])assert(b.includes(t));for(const bad of ['pptv-bridge','context-shadow','translat'])assert(!b.includes(bad),`untrusted source ${bad}`);});
check('PPTV cannot generate candidate',()=>assert(html.includes('pptvCanGenerateCandidate:false')));
check('Context cannot generate candidate',()=>assert(html.includes('contextCanGenerateCandidate:false')));
check('old observer chain disconnected',()=>{assert(html.includes('const mixedBridgeShadow=null;'));assert(html.includes('const contextualReconstructionShadow=null;'));});
check('ABSTAIN reads LCR only',()=>{const b=block('function abstainCandidateRows','function abstainCandidateEvidence');assert(b.includes('localRetriever?.shadowCandidates'));assert(!b.includes('mixed'));assert(!b.includes('contextual'));});
check('untrusted candidate hard blocked',()=>assert(html.includes("reason:'UNTRUSTED_CANDIDATE'")));
check('trusted local rescue remains conservative',()=>{for(const t of ['sourceFit>=.76','phonetic>=.74','top.score<.76','margin<.16','TRUSTED_LOCAL_RESCUE'])assert(html.includes(t),`missing ${t}`);});
check('translation rescue uses LCR pool',()=>{const b=block("function guardedTranslationRescueCandidates","function guardedKoreanGramSet");assert(b.includes('localRetrieverPool'));assert(!b.includes('activeTopicPack?.concepts'));});
check('translation rescue no longer requires Topic Pack',()=>{const b=block("function guardedTranslationRescue(text='',tgt='en')","// ---------- v0.9.30");assert(!b.slice(0,700).includes('!activeTopicPack'));});
check('source transcript remains untouched by LCR rescue',()=>assert(html.includes('sourceTranscriptMutation:false')));
check('source-hint guard is strict',()=>{for(const t of ['sourceFit||0)>=.78','sourceMargin>=.08','best.similarity>=.50'])assert(html.includes(t),`missing ${t}`);});
check('Acoustic HDR still disconnected',()=>assert(html.includes('acousticHdrRuntimeConnected:false')));
check('no external LLM integration',()=>{for(const t of ['api.openai.com','generativelanguage.googleapis.com','api.anthropic.com'])assert(!html.includes(t),`external LLM endpoint found ${t}`);});
const pass=checks.filter(x=>x.ok).length;const out={suite:'STOOM-LCR-1.0 Local Candidate Retriever',total:checks.length,pass,fail:checks.length-pass,checks};console.log(JSON.stringify(out,null,2));if(pass!==checks.length)process.exit(1);
