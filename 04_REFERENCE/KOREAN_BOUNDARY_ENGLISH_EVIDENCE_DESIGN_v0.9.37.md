# STOOM v0.9.37

## STOOM-KSBG-1.0
한국어의 강한 종결어미와 실제 음향 공백을 함께 사용해 문장을 확정합니다. 단순히 `다` 문자만으로 분할하지 않습니다. 같은 Chrome resultIndex가 누적 문자열을 반환해도 이미 확정한 prefix를 제거하고 suffix를 새 문장으로 취급합니다.

## Terminal Punctuation Normalizer
확정된 평서문은 `.`를, 강한 의문 종결형은 `?`를 보완합니다. 연결형(`...겠습니다만`)은 종결로 취급하지 않습니다.

## STOOM-EIE-1.0
ko-KR 세션에서 Chrome이 실제 Interim으로 출력한 Latin fragment만 보존합니다. 이 evidence는 Topic Pack/강의 용어집 등 trusted local candidate의 점수를 보조할 수 있지만 새 후보를 생성할 수 없습니다.

## Interaction safety
Watchdog, Main Speaker, Late/Orphan Final, N-best, STG, ABSTAIN 및 Local Candidate Retriever의 기존 권한을 확대하지 않습니다.
