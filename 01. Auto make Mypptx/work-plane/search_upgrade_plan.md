# Song Search Upgrade Plan

## 현재 상태
- **파일**: `song_search.py`
- **검색 사이트**: `getwater.tistory.com` (1개만 사용)
- **검색 방식**: Tistory 내부 검색 (`/search/{keyword}`)

---

## 업그레이드 목표

### A. 검색 사이트 추가
| 순서 | 사이트 | URL |
|------|--------|-----|
| 1 | getwater (기존) | https://getwater.tistory.com |
| 2 | cwy0675 (신규) | https://cwy0675.tistory.com |

---

### B. 검색 방법 (Search Methods)

#### 방법 1: cwy0675.tistory.com 직접 검색
- 사이트 내 '구글 맞춤 검색' 폼 활용
- 제목(title)을 검색창에 입력하여 검색

```
예시: "새찬송가 28장" 입력 → 검색 결과 파싱
```

#### 방법 2: Google Site Search
- Google 검색에서 `site:` 연산자 사용
- 특정 사이트 내에서만 검색

```
검색 형식: "{제목} site:cwy0675.tistory.com"
예시: "찬송하라 여호와의 종들아 site:cwy0675.tistory.com"
```

---

## 구현 계획

### Step 1: 새로운 검색 함수 추가
```python
# 추가할 상수
CWY_BASE_URL = "https://cwy0675.tistory.com"

# 방법 1: Tistory 내부 검색
def search_cwy0675(keyword):
    """cwy0675.tistory.com에서 검색"""
    pass

# 방법 2: Google Site Search
def search_google_site(keyword, site_domain):
    """Google에서 특정 사이트 내 검색"""
    # 검색어: "{keyword} site:{site_domain}"
    pass
```

### Step 2: 통합 검색 함수 수정
```python
def search_songs(keyword, sources=None):
    """
    여러 사이트에서 통합 검색

    Args:
        keyword: 검색어
        sources: 검색할 사이트 리스트 (기본값: 모든 사이트)
                 예: ['getwater', 'cwy0675', 'google']

    Returns:
        통합된 검색 결과 리스트
    """
    results = []

    # 1. getwater.tistory.com 검색 (기존)
    # 2. cwy0675.tistory.com 검색 (신규)
    # 3. Google site search (신규)

    return results
```

### Step 3: GUI 업데이트 (선택사항)
- 검색 소스 선택 옵션 추가 (체크박스)
- [ ] getwater.tistory.com
- [ ] cwy0675.tistory.com
- [ ] Google Search

---

## 질문 사항 (Questions)

1. **검색 우선순위**: 어떤 사이트를 먼저 검색할까요?
   - Option A: getwater → cwy0675 (기존 사이트 우선)
   - Option B: cwy0675 → getwater (새 사이트 우선)
   - Option C: 동시 검색 후 결과 병합

2. **Google 검색 사용**:
   - Option A: 항상 사용
   - Option B: 다른 사이트에서 결과 없을 때만 사용
   - Option C: 사용자가 선택

3. **중복 제거**:
   - 같은 곡이 여러 사이트에서 검색되면 어떻게 처리할까요?
   - 모두 표시 vs 중복 제거

---

## 예상 파일 변경

| 파일 | 변경 내용 |
|------|----------|
| `song_search.py` | 검색 함수 추가/수정 (핵심) |
| `song_downloader.py` | GUI에 소스 선택 옵션 추가 (선택) |

---

## 다음 단계

사용자 확인 후:
1. cwy0675.tistory.com 사이트 구조 분석
2. 검색 폼/결과 페이지 HTML 파싱 방법 확인
3. 코드 구현

---

## 사이트 분석 결과 (2026-01-02)

### ✅ cwy0675.tistory.com 검색 기능 확인

#### 1. 검색 URL 패턴
```
https://cwy0675.tistory.com/search/{검색어}
```

#### 2. 자연어 검색 테스트 결과

| 검색어 | 결과 수 | 상태 |
|--------|---------|------|
| 새찬송가 | 8건 | ✅ 정상 |
| 새찬송가 28장 | 0건 | ⚠️ 결과 없음 |
| 찬송하라 여호와의 종들아 | 1건 | ✅ 정상 |
| 우리에게 향하신 | 8건 | ✅ 정상 |

**결론**: 자연어(가사 첫 소절) 검색이 **완벽하게 작동**합니다.

#### 3. 다운로드 링크 구조

게시물 본문에서 직접 다운로드 링크 제공:
```
https://t1.daumcdn.net/cfile/tistory/{파일ID}/{파일명}.PPT
https://t1.daumcdn.net/cfile/tistory/{파일ID}/{파일명}_Wide.PPT
```

**예시**:
- 찬송하라 여호와의 종들아.PPT (4:3 버전)
- 찬송하라 여호와의 종들아_Wide.PPT (16:9 버전)

---

## 최종 권장사항 (Antigravity AI)

### ✅ **구현 가능 여부**: 가능 (난이도: 중)

### 🎯 **추천 구현 방식**

#### Step 1: cwy0675 Tistory 검색 추가
```python
def search_cwy0675(keyword):
    """
    cwy0675.tistory.com에서 검색
    
    Args:
        keyword: 자연어 검색어 (예: '찬송하라 여호와의 종들아')
    
    Returns:
        results: [
            {
                'title': '찬송하라 여호와의 종들아 NWC PPT악보',
                'url': 'https://cwy0675.tistory.com/entry/...',
                'source': 'cwy0675'
            }
        ]
    """
    search_url = f"https://cwy0675.tistory.com/search/{keyword}"
    # BeautifulSoup로 검색 결과 파싱
    # 제목, URL 추출
    return results
```

#### Step 2: 게시물에서 PPT 다운로드 링크 추출
```python
def get_download_info_cwy(post_url):
    """
    cwy0675 게시물에서 PPT 다운로드 링크 추출
    
    Returns:
        {
            'download_url': 'https://t1.daumcdn.net/cfile/...',
            'filename': '찬송하라 여호와의 종들아.PPT'
        }
    """
    # 게시물 본문에서 .PPT, _Wide.PPT 링크 찾기
    # <a href="https://t1.daumcdn.net/cfile/...">...</a> 패턴
    pass
```

#### Step 3: 통합 검색 함수 수정
```python
def search_songs(keyword, sources=['getwater', 'cwy0675']):
    """
    여러 사이트에서 통합 검색
    
    Args:
        keyword: 자연어 검색어
        sources: 검색할 사이트 리스트
    """
    results = []
    
    if 'getwater' in sources:
        results.extend(search_getwater(keyword))
    
    if 'cwy0675' in sources:
        results.extend(search_cwy0675(keyword))
    
    # 중복 제거 (제목 기준)
    return deduplicate_results(results)
```

---

## 질문 사항에 대한 답변

### 1. **검색 우선순위** → **옵션 C 추천** ✅
- **동시 검색 후 결과 병합**
- 이유: 두 사이트의 내용이 서로 다를 가능성이 높음
- getwater: 새찬송가 위주
- cwy0675: CCM, 복음송 위주

### 2. **Google 검색 사용** → **옵션 C 추천** ✅
- **사용자가 선택** (GUI에 체크박스)
- 이유: 
  - Tistory 직접 검색이 빠르고 정확함
  - Google은 필요시에만 사용 (선택적)
  - Rate limiting 위험 회피

### 3. **중복 제거** → **출처 표시 후 중복 제거** ✅
- 같은 제목은 하나만 표시
- 출처를 `[getwater]`, `[cwy0675]` 형태로 표시
- 예: `"28장 복의 근원 [getwater]"`

---

## 주의사항

### ⚠️ cwy0675 사이트 특성
1. **암호 보호**: 일부 게시물에 암호 설정되어 있음
   - 사이트 공지: "암호는 요청게시판에서 확인하세요"
   - 대응: 암호 입력 필요 여부 사전 체크
   
2. **링크 형식 다양성**:
   - 4:3 버전: `파일명.PPT`
   - 16:9 버전: `파일명_Wide.PPT`
   - NWC 파일: `파일명.nwc`
   - 대응: 사용자가 선택할 수 있도록 모든 링크 표시

### 💡 추가 개선 아이디어
- **필터 기능**: "새찬송가만", "CCM만" 등
- **정렬 기능**: 날짜순, 관련도순
- **미리보기**: 검색 결과에 가사 첫 줄 표시

---

**작성일**: 2026-01-02  
**분석 완료**: 2026-01-02 (Antigravity AI)  
**상태**: ✅ 구현 준비 완료  
**다음 단계**: 사용자 승인 후 `song_search.py` 업그레이드 시작