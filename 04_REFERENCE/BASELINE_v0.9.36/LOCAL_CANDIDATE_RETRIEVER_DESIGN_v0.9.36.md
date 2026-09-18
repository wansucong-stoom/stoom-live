# STOOM LIVE TRANSLATOR v0.9.36 · Local Candidate Retriever

## 목적
외부 LLM/API 없이, 이미 알고 있는 로컬 지식에서만 전문용어 후보를 검색한다. 후보 생성과 후보 검증을 분리해 엔진 간 상호 증폭과 과보정을 줄인다.

## 후보 출처
- 선택된 Topic Pack의 target preferred / alias
- 강의 용어집의 source → target 매핑
- 현재 target 언어로 등록된 인식 강화 용어

PPTV, Mixed Bridge, Context, 번역 결과는 후보를 새로 만들 수 없다.

## 검증
1. observed span 탐색
2. source hint(예: 프로젝트 베이스드 러닝)와 동일 언어 발음 유사도
3. target candidate(예: project-based learning)와 STG cross-script 구조 검증
4. trusted source / coverage / margin 검사
5. ABSTAIN Gate에서 WOULD_SELECT / WOULD_ABSTAIN 관측

## 실제 적용 범위
- 원문 STT: 변경하지 않음
- ABSTAIN Gate: Shadow-only
- Local Candidate Retriever: Shadow-only
- Guarded Translation Rescue: trusted local candidate에 한해 번역 입력 단계에서만 활성 사용
- Watchdog / Main Speaker / Endpoint / Recognition Ownership / Stable Top-1: 변경 없음

## 주요 안전 규칙
- untrusted candidate hard block
- PPTV/Context 자유 후보 생성 금지
- trusted local shortcut: sourceFit >= 0.76, phonetic >= 0.74, score >= 0.76, margin >= 0.16
- Stable Top-1에는 trusted-local shortcut 적용 금지
- 번역 rescue source-hint 경로: sourceFit >= 0.78, sourceMargin >= 0.08, cross-script similarity >= 0.50
