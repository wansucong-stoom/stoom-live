# STOOM-ABSTAIN-1.0 · v0.9.35 Shadow Candidate

## 목적
v0.9.33의 실시간 인식 안정 경로를 동결한 상태에서 N-best, Mixed Bridge, PPTV, STG, Topic/Context 결과를 서로 직접 덮어쓰지 못하게 하고, 중앙 Evidence Gate가 KEEP / SELECT / ABSTAIN 가능성만 관측한다.

## 중요한 제한
- Shadow-only: 실제 STT 원문, 번역 입력/출력, TTS, Endpoint, Main Speaker, Watchdog, Commit 결과를 변경하지 않는다.
- Acoustic HDR은 아직 LIVE runtime에 연결하지 않는다.
- 번역 결과만으로 생성된 후보는 금지한다.
- Observer STG는 `recordStats:false`로 실행하여 기존 운영 통계/D1 카운터에 섞이지 않는다.
- 진단은 `traceDiagnosticState.abstainGate`와 `abstain_gate.shadow` 이벤트에만 기록한다.

## Evidence groups
- Acoustic 0.30 (현재 runtime 미연결)
- Recognition 0.25
- Phonetic(STG/PPTV) 0.20
- Term Prior 0.15
- Context 0.10

가용한 evidence만 정규화하되 SELECT 후보는 Core evidence 2개 이상과 Phonetic >= 0.65가 필요하다.

## Hard gates
- NO_CANDIDATE
- NO_DISCRIMINATION
- TRANSLATION_DERIVED_ONLY
- SHORT_NATIVE_GUARD
- LOW_COVERAGE (< 0.64)
- INSUFFICIENT_INDEPENDENCE
- PHONETIC_GUARD (< 0.65)
- LOW_SCORE (< 0.78, Stable Top-1은 < 0.86)
- LOW_MARGIN (< 0.12, Stable Top-1은 < 0.15)
- EVAL_BUDGET

## Performance isolation
- `requestIdleCallback` 우선, 미지원 시 24ms 지연 task
- latest-only observer queue
- 최대 8 후보
- 6ms evaluation budget
- 진단 적체 시 이전 pending observer는 drop하고 실시간 경로를 우선
