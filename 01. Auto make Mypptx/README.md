# PPT Automation Tools

교회 예배 PPT 자동화 도구 모음

## 프로젝트 구성

### 1. 금요/수요 기도회 PPT 자동화 도구
찬양곡과 성경 본문을 자동으로 병합하여 예배용 PPT를 생성합니다.

**주요 기능:**
- 찬양 PPT 자동 삽입 (설교 전/후 구분)
- 성경 본문 자동 삽입 및 슬라이드 분할
- 금요/수요 기도회 모드 전환
- 날짜 자동 계산 및 파일명 생성
- PowerPoint 프로세스 관리



**파일:**
- `gui.py` - GUI 인터페이스
- `main.py` - PPT 생성 로직

### 2. 찬송가 다운로더 (v2.0)
getwater.tistory.com에서 찬송가 PPT를 검색하고 다운로드합니다.

**주요 기능:**
- 일괄 다운로드 (여러 곡 동시 다운로드)
- 범위 입력 지원 (예: 28-32)
- 쉼표 구분 입력 지원 (예: 28, 29, 30)
- 찬송가 종류 선택 (새찬송가/통일찬송가/악보)
- 파일명 자동 번호 부여
- 실시간 진행 상황 표시

**파일:**
- `work-plane/song_downloader.py` - GUI 다운로더
- `work-plane/song_search.py` - 웹 스크래핑 로직
- `work-plane/찬송가_다운로더_개발계획.md` - 개발 문서

## 설치

### 필수 요구사항
- Python 3.8 이상
- Windows OS (PowerPoint COM 사용)
- Microsoft PowerPoint

### 패키지 설치
```bash
pip install pywin32
pip install beautifulsoup4
pip install requests
```

## 사용 방법

### PPT 자동화 도구
```bash
python gui.py
```

1. PPT 폴더 설정 (찬양 파일 위치)
2. 템플릿 파일 선택
3. 출력 파일 경로 설정
4. 찬양곡 선택 (설교 전/후)
5. 성경 본문 입력
6. "Generate PPT" 클릭

### 찬송가 다운로더
```bash
cd work-plane
python song_downloader.py
```

**일괄 다운로드:**
1. 찬송가 번호 입력 (예: `28-32` 또는 `28, 29, 30`)
2. 종류 선택 (새찬송가 ppt/통일찬송가 ppt/새찬송가 악보)
3. 저장 경로 확인
4. "일괄 다운로드" 클릭

**개별 검색:**
1. 검색어 입력 (예: `새찬송가 ppt 28장`)
2. "검색" 클릭
3. 결과에서 선택
4. "선택한 곡 다운로드" 클릭

## 주요 기능 상세

### 성경 본문 분할
성경 본문이 길 경우 `/`로 구분하여 여러 슬라이드로 자동 분할:
```
1절 내용입니다. / 2절 내용입니다. / 3절 내용입니다.
```

### 파일명 자동 관리
다운로드된 찬송가 파일명에 자동으로 순번 부여:
```
1. 28장_복의 근원 강림하사_새찬송가악보_PPT.ppt
2. 29장_성부 성자 성신_새찬송가악보_PPT.ppt
3. 30장_전능왕 오셔서_새찬송가악보_PPT.ppt
```

### 모드 전환
- **금요 기도회 모드**: 기본 설정
- **수요 기도회 모드**: 설교 제목 슬라이드 추가

## 기술 스택

- **GUI**: Tkinter
- **PowerPoint 자동화**: win32com (pywin32)
- **웹 스크래핑**: BeautifulSoup4, Requests
- **파일 처리**: Python os, pathlib

## 프로젝트 구조

```
.
├── gui.py                          # PPT 자동화 GUI
├── main.py                         # PPT 생성 로직
├── work-plane/
│   ├── song_downloader.py         # 찬송가 다운로더 GUI
│   ├── song_search.py             # 웹 스크래핑 모듈
│   └── 찬송가_다운로더_개발계획.md  # 개발 문서
├── .gitignore
└── README.md
```

## 개발 히스토리

- **v1.0** (2025-12-05): 금요 기도회 PPT 자동화 완성
- **v1.35** (2025-12-05): 수요 기도회 모드 추가
- **v2.0** (2025-12-28): 찬송가 일괄 다운로더 추가

## 라이선스

개인 및 교회 사용 목적으로 자유롭게 사용 가능합니다.

## 기여

버그 리포트 및 개선 제안은 이슈로 등록해주세요.

## 작성자

Park Hyojoon (박효준)

---

**Generated with Claude Code**
