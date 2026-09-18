STOOM LIVE TRANSLATOR v0.9.37 · KOREAN BOUNDARY + ENGLISH EVIDENCE

이 ZIP은 v0.9.36 FULL PACKAGE의 전체 구조를 승계한 정식 전체 패키지입니다.

폴더
01_PAGES  : 배포 파일 전체(index/updates/contact/latest + 직접배포 ZIP)
02_WORKER : Worker 변경 없음 안내
03_D1     : D1 변경 없음 안내
04_REFERENCE: 회귀 테스트, 설계/검증, diff, baseline 자료

핵심 변경
1. STOOM-KSBG-1.0: 한국어 강한 종결어미 + 실제 음향 공백 기반 문장 경계
2. cumulative result prefix strip: `...마치겠습니다이 내용은...` 분리
3. Terminal Punctuation Normalizer: 평서문 `.` / 강한 의문문 `?`
4. STOOM-EIE-1.0: 실제 관측된 영문 Interim만 trusted local candidate의 보조 증거로 사용

배포 범위
Pages: 변경 필요
Worker: 변경 없음 (v0.10.19 유지)
D1: 변경 없음 (마이그레이션 없음)
