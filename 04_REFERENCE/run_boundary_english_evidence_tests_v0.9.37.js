const assert=require('assert');
function norm(s=''){return String(s).replace(/\s+/g,' ').trim();}
function clampNumber(v,min,max){v=Number(v);return Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;}
function textSimilarity(a='',b=''){a=String(a);b=String(b);if(a===b)return 1;let i=0;while(i<Math.min(a.length,b.length)&&a[i]===b[i])i++;return i/Math.max(a.length,b.length,1);}
let source='ko'; function sourceShort(){return source;}
let sessionCorrectionStats={}; function traceEvent(){};
function optionalFiniteNumber(v){const n=Number(v);return Number.isFinite(n)?n:null;}
const performance={now:()=>NOW}; let NOW=1000; let runtimeSpeechGate=null;
function koreanFormalSentenceEnding(text=''){
 const s=norm(text).replace(/[.!?。！？]+$/,'').trim(); if(!s)return false;
 if(/(?:[가-힣]니다|[가-힣]니까)$/.test(s))return true;
 return /(?:해요|돼요|이에요|예요|거예요|할게요|볼게요|하세요|보세요|되죠|있죠|없죠|맞죠|그렇죠|겠죠|인가요|건가요|은가요|는가요|을까요|할까요|될까요|있나요|없나요|되나요|맞나요|아닌가요|나요|까요)$/.test(s);
}
function isKoreanSentenceEnding(text='') {const s=norm(text);if(!s)return false;if(/[.!?。！？]["'”’)]?$/.test(s))return true;const core=s.replace(/["'”’)]$/,'');return koreanFormalSentenceEnding(core);}
function stripTerminalSentencePunctuation(text=''){return norm(text).replace(/[.!?。！？]+$/,'').trim();}
function cumulativeSuffixAfterBoundary(base='',incoming=''){
 const a=stripTerminalSentencePunctuation(base),b=norm(incoming);if(!a||!b||b.length<=a.length)return '';
 if(b.startsWith(a))return b.slice(a.length).replace(/^[.!?。！？\s]+/,'').trim();
 const prefix=b.slice(0,Math.min(b.length,a.length));if(prefix.length>=Math.max(8,Math.round(a.length*.86))&&textSimilarity(a,prefix,'ko')>=.94)return b.slice(prefix.length).replace(/^[.!?。！？\s]+/,'').trim();return '';
}
function koreanQuestionMorphology(text=''){const s=norm(text).replace(/[?？.!。！]+$/,'').trim();if(!s)return {strength:'none',ending:''};const strong=s.match(/(합니까|됩니까|습니까|입니까|인가요|건가요|은가요|는가요|을까요|ㄹ까요|할까요|될까요|있나요|없나요|되나요|맞나요|아닌가요|나요|까요)$/);if(strong)return {strength:'strong',ending:strong[1]};return {strength:'none',ending:''};}
function applyTerminalSentencePunctuation(text=''){const clean=norm(text);if(!clean||/[.!?。！？]["'”’)]?$/.test(clean)||sourceShort()!=='ko')return {text:clean,applied:false};if(!isKoreanSentenceEnding(clean))return {text:clean,applied:false};const morphology=koreanQuestionMorphology(clean);const mark=morphology.strength==='strong'?'?':'.';return {text:clean+mark,applied:true,mark};}

assert(isKoreanSentenceEnding('수업을 마치겠습니다'));
assert(isKoreanSentenceEnding('학교에 갑니다'));
assert(isKoreanSentenceEnding('이 방법이 좋습니다'));
assert(isKoreanSentenceEnding('이해하셨습니까'));
assert(!isKoreanSentenceEnding('설명하겠습니다만'));
assert(!isKoreanSentenceEnding('이것은 필요'));
assert(!isKoreanSentenceEnding('설명하고'));
assert.equal(cumulativeSuffixAfterBoundary('마지막에 학생들의 질문을 받고 수업을 마치겠습니다','마지막에 학생들의 질문을 받고 수업을 마치겠습니다이 내용은 다음 시간에 자세히 설명하겠습니다'),'이 내용은 다음 시간에 자세히 설명하겠습니다');
assert.equal(cumulativeSuffixAfterBoundary('마치겠습니다.','마치겠습니다. 이 내용은 다음 시간에 설명하겠습니다'),'이 내용은 다음 시간에 설명하겠습니다');
assert.deepEqual(applyTerminalSentencePunctuation('수업을 마치겠습니다'),{text:'수업을 마치겠습니다.',applied:true,mark:'.'});
assert.deepEqual(applyTerminalSentencePunctuation('이해하셨습니까'),{text:'이해하셨습니까?',applied:true,mark:'?'});
assert.equal(applyTerminalSentencePunctuation('설명하겠습니다만').text,'설명하겠습니다만');

const STOOM_ENGLISH_INTERIM_EVIDENCE_VERSION='STOOM-EIE-1.0',ENGLISH_INTERIM_EVIDENCE_TTL_MS=5200; const observedEnglishInterimEvidence=new Map();
function englishInterimEvidenceKey(meta={}){const g=optionalFiniteNumber(meta.generation)??optionalFiniteNumber(runtimeSpeechGate?.lastInterimRecognitionGeneration)??0;const r=optionalFiniteNumber(meta.resultIndex)??optionalFiniteNumber(meta.eventResultIndex)??optionalFiniteNumber(runtimeSpeechGate?.lastInterimEventResultIndex)??-1;return `${g}:${r}`;}
function pruneEnglishInterimEvidence(now=performance.now()){for(const [k,v] of observedEnglishInterimEvidence){if(!v?.at||now-v.at>ENGLISH_INTERIM_EVIDENCE_TTL_MS)observedEnglishInterimEvidence.delete(k);}}
function captureObservedEnglishInterimEvidence(text='',meta={}){if(sourceShort()!=='ko')return;const clean=norm(text);if(!clean)return;const fragments=(clean.match(/[A-Za-z][A-Za-z'’-]{2,}/g)||[]).map(x=>x.toLowerCase().replace(/[^a-z'-]/g,'')).filter(x=>x.length>=3);if(!fragments.length)return;const now=performance.now();pruneEnglishInterimEvidence(now);const key=englishInterimEvidenceKey(meta),prev=observedEnglishInterimEvidence.get(key)||{fragments:[],at:0,generation:optionalFiniteNumber(meta.generation),resultIndex:optionalFiniteNumber(meta.resultIndex)??optionalFiniteNumber(meta.eventResultIndex)};const set=new Set([...(prev.fragments||[]),...fragments]);prev.fragments=[...set].sort((a,b)=>b.length-a.length).slice(0,8);prev.at=now;observedEnglishInterimEvidence.set(key,prev);}
function englishInterimCandidateFit(candidate='',meta={}){const cand=String(candidate||'').toLowerCase().replace(/[^a-z]/g,'');if(cand.length<3)return 0;const now=performance.now();pruneEnglishInterimEvidence(now);const keys=[];const exact=englishInterimEvidenceKey(meta);const metaResult=optionalFiniteNumber(meta.resultIndex)??optionalFiniteNumber(meta.eventResultIndex);if(observedEnglishInterimEvidence.has(exact))keys.push(exact);else if(metaResult===null){const gen=optionalFiniteNumber(meta.generation)??optionalFiniteNumber(runtimeSpeechGate?.lastInterimRecognitionGeneration);for(const [k,row] of observedEnglishInterimEvidence){if(gen!==null&&row?.generation!==null&&row?.generation!==gen)continue;if(now-(row?.at||0)<=1800)keys.push(k);}}let best=0;for(const k of keys){const row=observedEnglishInterimEvidence.get(k);if(!row||now-row.at>ENGLISH_INTERIM_EVIDENCE_TTL_MS)continue;for(const fragmentRaw of row.fragments||[]){const f=fragmentRaw.replace(/[^a-z]/g,'');if(f.length<3)continue;let fit=0;if(cand.startsWith(f))fit=.62+.38*Math.min(1,f.length/7);else if(f.startsWith(cand))fit=.82;else{const prefix=cand.slice(0,Math.max(3,Math.min(cand.length,f.length+2)));fit=.68*textSimilarity(f,prefix,'en');}if(f.length<4)fit=Math.min(fit,.79);if(fit>best)best=fit;}}return clampNumber(best,0,1);}

captureObservedEnglishInterimEvidence('beh',{generation:1,eventResultIndex:5});
const behavior=englishInterimCandidateFit('behaviorism',{generation:1,resultIndex:5});
const construct=englishInterimCandidateFit('constructivism',{generation:1,resultIndex:5});
assert(behavior>=0.77,behavior);
assert(construct<behavior,`${construct} !< ${behavior}`);
assert.equal(englishInterimCandidateFit('behaviorism',{generation:1,resultIndex:6}),0); // no cross-result leakage
NOW=7000; assert.equal(englishInterimCandidateFit('behaviorism',{generation:1,resultIndex:5}),0); // TTL
console.log('v0.9.37 boundary/evidence tests PASS', {behavior,construct});
