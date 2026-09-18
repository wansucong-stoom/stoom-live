# STOOM LIVE TRANSLATOR

> 강의·발표 현장을 위한 브라우저 기반 실시간 음성 번역 도구

[![Service](https://img.shields.io/badge/Service-trans.stoom.win-6C63FF)](https://trans.stoom.win/)
![Version](https://img.shields.io/badge/version-v0.9.37-1F6FEB)
![Status](https://img.shields.io/badge/status-active_development-2EA44F)

## 소개

**STOOM LIVE TRANSLATOR**는 강의실과 발표 현장의 연속 발화를 실시간으로 인식하고 번역하여 화면에 표시하는 도구입니다. 단순한 문장 번역을 넘어 실제 수업 환경에서 발생하는 소음, 짧은 멈춤, 연속 발화, 전문용어 및 늦게 도착하는 음성인식 결과를 안정적으로 처리하는 데 초점을 두고 있습니다.

- 서비스: [https://trans.stoom.win/](https://trans.stoom.win/)
- 문의: [STOOM LIVE TRANSLATOR 문의 폼](https://forms.gle/hLVRKCkALdyDdceB8)
- Instagram: [@superstarcong](https://www.instagram.com/superstarcong/)
- Brand: **STOOM LAB**

## 주요 기능

### 실시간 음성인식과 번역

- 강의·발표의 연속 발화를 문장 단위로 정리
- 번역 결과를 우선 표시하고 필요한 경우 같은 카드를 자연스럽게 수정
- 늦게 도착한 최종 인식 결과를 기존 문장에 복원
- Bluetooth·USB 마이크 등 브라우저에서 선택 가능한 입력 장치 지원

### 강의 환경 안정화

- 소음 수준과 발화 구간에 따른 적응형 문장 경계
- 짧은 멈춤과 실제 문장 종료를 구분하는 Endpoint Guard
- 주 발화자 흐름을 유지하는 Main Speaker Guard
- 음성인식 중단을 감지하고 복구하는 STT Watchdog
- 같은 문장의 중복 출력·낭독을 줄이는 Final/Interim 보호 로직

### 전문용어와 발음 보정

- Topic Pack 기반 전문용어 적용
- 공백·하이픈·대소문자 차이를 흡수하는 용어 정규화
- 외래 전문용어의 구조적 음역 오류를 관측하는 Structural Transliteration Guard
- 사용자 발음 특성을 반영하기 위한 개인 발음 캘리브레이션 구조

### 음성 출력과 진단

- 브라우저가 지원하는 TTS 언어 자동 진단
- 음성 출력 속도 설정
- 원음 없이 처리 흐름을 확인할 수 있는 로컬 Diagnostic Trace JSON
- 엔진별 기여도와 회귀 여부를 사용자 화면과 분리해 진단 가능

## 현재 기준 버전

### v0.9.37 — Korean Boundary & English Evidence

한국어 종결어미와 음향 공백을 함께 고려해 문장 경계를 판단하고, 영어 번역 결과를 보조 근거로 활용하는 경계 안정화 버전입니다.

기존의 Recognition Stability Fix, Independent STG Observer, Continuous Lecture Pipeline, Context N-best + Prosody, Late Final Recovery, Fast Endpoint & Priority Translation, Tiny Vector Decision Layer를 유지합니다.

## 사용 방법

1. [STOOM LIVE TRANSLATOR](https://trans.stoom.win/)에 접속합니다.
2. 안내에 따라 사용 코드를 입력합니다.
3. 마이크 사용 권한을 허용합니다.
4. 원문 언어와 번역 언어, 입력 장치 및 음성 출력 설정을 선택합니다.
5. 번역을 시작하고 강의 또는 발표 음성을 입력합니다.

브라우저의 음성인식·음성합성 지원 범위와 운영체제 설정에 따라 사용할 수 있는 언어와 음성이 달라질 수 있습니다.

## 개인정보 및 진단 원칙

- 원음, 인식 원문, 번역문 및 합성 음성을 서버에 저장하지 않습니다.
- 운영 진단에는 익명 세션 식별자와 기능 상태 중심의 정보만 사용합니다.
- 로컬 Diagnostic Trace는 사용자가 직접 저장할 때만 파일로 남습니다.
- 개인 발음 캘리브레이션 정보와 사용자 설정은 기능에 필요한 범위에서 관리합니다.

## 저장소 구성

```text
stoom-live/
├── README.md
├── 01_PAGES/        # Pages 배포 파일과 최신 단일 HTML
├── 02_WORKER/       # Worker 변경 여부 및 배포 자료
├── 03_D1/           # D1 변경 여부 및 마이그레이션 자료
├── 04_REFERENCE/    # 설계·변경 diff·회귀 테스트·검증 보고서
└── releases/        # 버전별 원본 전체 패키지
```

## v0.9.37 배포 범위

| 구성요소 | 변경 여부 | 적용 내용 |
|---|---|---|
| Pages | **변경 필요** | `01_PAGES/`의 최신 HTML·정적 파일 배포 |
| Worker | **변경 없음** | `02_WORKER/NO_WORKER_CHANGE_v0.9.37.txt` |
| D1 | **변경 없음** | `03_D1/NO_D1_CHANGE_v0.9.37.txt` |

## 배포 원칙

새 버전을 배포할 때 다음 범위를 각각 확인합니다.

| 구성요소 | 확인 내용 |
|---|---|
| Pages | 서비스 HTML 및 정적 파일 변경 여부 |
| Worker | 인증·API·진단 처리 변경 여부 |
| D1 | 스키마 또는 데이터 마이그레이션 필요 여부 |

## 개발 상태

현재 적극적으로 개발·검증 중인 프로젝트입니다. 브라우저와 운영체제, 마이크, 네트워크 및 음성인식 서비스 상태에 따라 결과가 달라질 수 있습니다.

---

**STOOM LAB** · Small tools, meaningful change.
