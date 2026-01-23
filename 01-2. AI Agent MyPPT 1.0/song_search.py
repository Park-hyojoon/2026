"""
찬송가 검색 및 다운로드 모듈
getwater.tistory.com 및 cwy0675.tistory.com에서 찬송가 PPT 파일을 검색하고 다운로드합니다.
"""

import requests
from bs4 import BeautifulSoup
import os
import re
import difflib
from urllib.parse import quote, urljoin

# User-Agent 설정 (봇 차단 방지)
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# getwater.tistory.com (기존)
BASE_URL = "https://getwater.tistory.com"
SEARCH_URL = "https://getwater.tistory.com/search/{keyword}"

# cwy0675.tistory.com (신규)
CWY_BASE_URL = "https://cwy0675.tistory.com"
CWY_SEARCH_URL = "https://cwy0675.tistory.com/search/{keyword}"



def sanitize_filename(filename):
    """
    파일명에서 Windows에서 금지된 특수문자 제거
    """
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')

    # 파일명 길이 제한 (Windows 260자 경로 제한 고려)
    if len(filename) > 200:
        name, ext = os.path.splitext(filename)
        filename = name[:200-len(ext)] + ext

    return filename.strip()


def search_getwater(keyword):
    """
    getwater.tistory.com에서 찬송가를 검색합니다.

    Args:
        keyword: 검색어 (예: "새찬송가 ppt 28장")

    Returns:
        list: 검색 결과 리스트 [{'title': ..., 'url': ..., 'source': 'getwater'}, ...]
    """
    results = []

    try:
        # URL 인코딩
        encoded_keyword = quote(keyword)
        search_url = SEARCH_URL.format(keyword=encoded_keyword)

        response = requests.get(search_url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # 검색 결과 파싱 (Tistory 검색 결과 구조)
        # 검색 결과는 보통 article 또는 .post-item 클래스에 있음
        articles = soup.select('.searchList li, .search-result-item, article, .post-item')

        if not articles:
            # 대체 선택자 시도
            articles = soup.select('a[href*="/"]')

        for article in articles:
            try:
                # 링크 찾기
                link = article if article.name == 'a' else article.find('a')
                if not link or not link.get('href'):
                    continue

                href = link.get('href')

                # 숫자로 끝나는 게시물 링크만 추출 (예: /2645)
                if not re.search(r'/\d+$', href):
                    continue

                # 전체 URL 생성
                full_url = urljoin(BASE_URL, href)

                # 제목 추출
                title = link.get_text(strip=True)
                if not title:
                    title_elem = article.find(['h2', 'h3', '.title', '.tit'])
                    if title_elem:
                        title = title_elem.get_text(strip=True)

                if title and len(title) > 3:  # 너무 짧은 제목 제외
                    # 중복 체크
                    if not any(r['url'] == full_url for r in results):
                        results.append({
                            'title': title,
                            'url': full_url,
                            'source': 'getwater',
                            'thumbnail': None
                        })
            except Exception as e:
                continue

    except requests.RequestException as e:
        print(f"[getwater] 검색 오류: {e}")
        # 오류 발생해도 빈 결과 반환 (다른 소스 검색 계속)

    return results


def search_cwy0675(keyword):
    """
    cwy0675.tistory.com에서 찬송가를 검색합니다.
    자연어 검색(가사 첫 소절)을 지원합니다.

    Args:
        keyword: 검색어 (예: "찬송하라 여호와의 종들아")

    Returns:
        list: 검색 결과 리스트 [{'title': ..., 'url': ..., 'source': 'cwy0675'}, ...]
    """
    results = []

    # 검색어 정규화 (소문자화, 공백 제거)
    normalized_keyword = re.sub(r'\s+', '', keyword).lower()
    
    try:
        # URL 인코딩
        encoded_keyword = quote(keyword)
        search_url = CWY_SEARCH_URL.format(keyword=encoded_keyword)

        response = requests.get(search_url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # cwy0675 검색 결과 파싱
        articles = soup.select('.searchList li, .search-result-item, article, .post-item')

        if not articles:
            articles = soup.select('a[href*="entry"]')

        for article in articles:
            try:
                # 링크 찾기
                link = article if article.name == 'a' else article.find('a')
                if not link or not link.get('href'):
                    continue

                href = link.get('href')
                if '/entry/' not in href and not re.search(r'/\d+$', href):
                    continue

                full_url = urljoin(CWY_BASE_URL, href)

                # 제목 추출
                title = link.get_text(strip=True)
                if not title:
                    title_elem = article.find(['h2', 'h3', '.title', '.tit'])
                    if title_elem:
                        title = title_elem.get_text(strip=True)

                if title and len(title) > 3:
                # 제목 정규화 및 필터링
                    normalized_title = re.sub(r'\s+', '', title).lower()
                    
                    # 검색어 일치 여부 확인 (유사도 검사 추가)
                    is_match = False
                    
                    # 1. 정확한 포함 확인
                    if normalized_keyword in normalized_title:
                        is_match = True
                    # 2. 포함되지 않았다면 유사도 검사 (오타/조사 차이 허용)
                    else:
                        matcher = difflib.SequenceMatcher(None, normalized_keyword, normalized_title)
                        # 가장 긴 연속 매칭 구간 찾기
                        match = matcher.find_longest_match(0, len(normalized_keyword), 0, len(normalized_title))
                        
                        # 검색어의 60% 이상이 연속해서 일치하면 통과 (예: '승리하'셨네 -> '승리하'였네)
                        # 3글자 이상인 경우에만 적용 (짧은 단어는 오탐 방지)
                        if len(normalized_keyword) >= 3 and match.size >= len(normalized_keyword) * 0.6:
                            is_match = True
                    
                    # 검색어가 제목에 포함되어 있거나 유사하면 결과에 추가
                    if is_match:
                        # 중복 체크
                        if not any(r['url'] == full_url for r in results):
                            # 관련도 점수 계산 (앞에 있을수록 높음)
                            # 유사 매칭인 경우 find가 -1일 수 있으므로 처리
                            idx = normalized_title.find(normalized_keyword)
                            if idx == -1:
                                idx = 999  # 정확한 매칭이 아니면 뒤로 보냄
                                
                            results.append({
                                'title': title,
                                'url': full_url,
                                'source': 'cwy0675',
                                'thumbnail': None,
                                'score': idx
                            })
            except Exception as e:
                continue

        # 관련도(score) 순으로 정렬 (0에 가까울수록 제목 시작 부분에 위치)
        results.sort(key=lambda x: x['score'])
        
        # 임시 score 필드 삭제
        for r in results:
            r.pop('score', None)

    except requests.RequestException as e:
        print(f"[cwy0675] 검색 오류: {e}")

    return results

def search_songs(keyword, sources=None):
    """
    여러 사이트에서 통합 검색합니다.

    Args:
        keyword: 검색어 (자연어 또는 번호 검색 지원)
        sources: 검색할 사이트 리스트 (기본값: ['getwater', 'cwy0675'])
                 예: ['getwater'], ['cwy0675'], ['getwater', 'cwy0675']

    Returns:
        list: 통합 검색 결과 리스트 [{'title': ..., 'url': ..., 'source': ...}, ...]
    """
    if sources is None:
        sources = ['getwater', 'cwy0675']

    results = []

    # getwater.tistory.com 검색
    if 'getwater' in sources:
        try:
            getwater_results = search_getwater(keyword)
            results.extend(getwater_results)
        except Exception as e:
            print(f"[getwater] 검색 실패: {e}")

    # cwy0675.tistory.com 검색
    if 'cwy0675' in sources:
        try:
            cwy_results = search_cwy0675(keyword)
            results.extend(cwy_results)
        except Exception as e:
            print(f"[cwy0675] 검색 실패: {e}")

    return results



def get_download_info(post_url):
    """
    게시물 페이지에서 다운로드 링크와 파일명을 추출합니다.

    Args:
        post_url: 게시물 URL

    Returns:
        dict: {'download_url': ..., 'filename': ..., 'title': ...}
    """
    try:
        response = requests.get(post_url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # 게시물 제목
        title = ""
        title_elem = soup.find(['h1', '.title', '.tit', 'title'])
        if title_elem:
            title = title_elem.get_text(strip=True)

        # 다운로드 링크 찾기
        download_url = None
        filename = None

        # 본문 영역 찾기 (Tistory 공통 클래스들)
        content_area = soup.find(['article', '.entry-content', '.post-content', '.tt_article_useless_p_margin', '#content', '#article'])
        
        # 본문 영역에서만 링크 찾기 (관련글 등 제외)
        search_target = content_area if content_area else soup
        all_links = search_target.find_all('a', href=True)
        
        # 1차 시도: PPT 확장자가 포함된 링크 우선 찾기
        for link in all_links:
            href = link.get('href', '')
            link_text = link.get_text().lower()
            
            is_download_link = 't1.daumcdn.net' in href or 'tistory.com/attachment' in href
            
            if is_download_link:
                # PPT 파일인지 확인
                if '.ppt' in href.lower() or '.pptx' in href.lower() or '.ppt' in link_text or '.pptx' in link_text:
                    download_url = href
                    
                    # 파일명 추출 시도
                    parent = link.parent
                    if parent:
                        parent_text = parent.get_text()
                        match = re.search(r'([^\n]+\.(ppt|pptx))', parent_text, re.IGNORECASE)
                        if match:
                            filename = match.group(1).strip()
                    break
        
        # 2차 시도: PPT 전용 링크를 못 찾았을 경우 가장 첫 번째 다운로드 링크 사용
        if not download_url:
            for link in all_links:
                href = link.get('href', '')
                if 't1.daumcdn.net' in href or 'tistory.com/attachment' in href:
                    download_url = href
                    break


        # 패턴 2: 이미지 다운로드 링크 (original 파라미터)
        if not download_url:
            images = soup.find_all('img', src=True)
            for img in images:
                src = img.get('src', '')
                if 't1.daumcdn.net' in src or 'tistory.com' in src:
                    # original 버전 URL로 변환
                    if '?' not in src:
                        download_url = src + '?original'
                    else:
                        download_url = src
                    break

        # 패턴 3: 본문에서 파일명 패턴 찾기
        if not filename:
            content = soup.find(['article', '.entry-content', '.post-content', '#content'])
            if content:
                text = content.get_text()
                # PPT 파일명 패턴 찾기
                match = re.search(r'(\d+장[^.]+\.(ppt|pptx))', text, re.IGNORECASE)
                if match:
                    filename = match.group(1)

        # 패턴 4: 서버 헤더에서 파일명 확인 (HEAD 요청)
        if not filename and download_url:
            try:
                head_resp = requests.head(download_url, headers=HEADERS, timeout=5, allow_redirects=True)
                content_disposition = head_resp.headers.get('Content-Disposition', '')
                if 'filename' in content_disposition:
                    # filename="abc.ppt" 또는 filename*=UTF-8''%ED%8C%8C%EC%9D%BC.ppt 추출
                    fname_match = re.search(r"filename\*=UTF-8''(.+)", content_disposition)
                    if fname_match:
                        filename = urllib.parse.unquote(fname_match.group(1))
                    else:
                        fname_match = re.search(r'filename="(.+)"', content_disposition)
                        if fname_match:
                            filename = fname_match.group(1)
            except:
                pass

        # 파일명이 없으면 제목에서 생성
        if not filename and title:
            filename = sanitize_filename(title) + ".ppt"
        
        # 파일명에서 불필요한 공백 및 인코딩 잔재 제거
        if filename:
            filename = filename.strip('"').strip("'")

        return {
            'download_url': download_url,
            'filename': filename,
            'title': title
        }

    except requests.RequestException as e:
        raise Exception(f"페이지 로드 실패: {e}")


def download_file(download_url, save_path, progress_callback=None):
    """
    파일을 다운로드합니다.

    Args:
        download_url: 다운로드 URL
        save_path: 저장 경로 (전체 파일 경로)
        progress_callback: 진행률 콜백 함수 (percent)

    Returns:
        bool: 성공 여부
    """
    temp_path = save_path + '.tmp'

    try:
        response = requests.get(download_url, headers=HEADERS, timeout=60, stream=True)
        response.raise_for_status()

        # 파일 크기
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0

        # 저장 폴더 생성
        save_dir = os.path.dirname(save_path)
        if not os.path.exists(save_dir):
            os.makedirs(save_dir, exist_ok=True)

        # 임시 파일로 다운로드
        with open(temp_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)

                    if progress_callback and total_size > 0:
                        percent = int((downloaded / total_size) * 100)
                        progress_callback(percent)

        # 완료 후 정식 파일명으로 변경
        if os.path.exists(save_path):
            os.remove(save_path)
        os.rename(temp_path, save_path)

        return True

    except Exception as e:
        # 실패 시 임시 파일 삭제
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
        raise Exception(f"다운로드 실패: {e}")


def search_and_get_first(keyword):
    """
    검색하고 첫 번째 결과의 다운로드 정보를 반환합니다.

    Args:
        keyword: 검색어

    Returns:
        dict: {'title': ..., 'download_url': ..., 'filename': ..., 'post_url': ...}
    """
    results = search_songs(keyword)

    if not results:
        raise Exception("검색 결과가 없습니다.")

    first_result = results[0]
    download_info = get_download_info(first_result['url'])

    return {
        'title': first_result['title'],
        'post_url': first_result['url'],
        'download_url': download_info['download_url'],
        'filename': download_info['filename']
    }


# 테스트용
if __name__ == "__main__":
    print("=" * 50)
    print("찬송가 통합 검색 테스트")
    print("=" * 50)
    
    # 테스트 1: 번호 검색 (getwater)
    keyword1 = "새찬송가 ppt 28장"
    print(f"\n[테스트 1] 검색어: {keyword1}")
    
    try:
        results = search_songs(keyword1)
        print(f"통합 검색 결과: {len(results)}개")
        
        for i, result in enumerate(results[:3]):
            source = result.get('source', 'unknown')
            print(f"  {i+1}. [{source}] {result['title']}")
            print(f"     URL: {result['url']}")
            # 상세 정보 추출 테스트 (파일명 검증용)
            try:
                info = get_download_info(result['url'])
                print(f"     파일명: {info['filename']}")
            except:
                print("     파일명 추출 실패")

            
    except Exception as e:
        print(f"오류: {e}")
    
    # 테스트 2: 자연어 검색 (cwy0675)
    keyword2 = "찬송하라 여호와의 종들아"
    print(f"\n[테스트 2] 검색어: {keyword2}")
    
    try:
        results = search_songs(keyword2)
        print(f"통합 검색 결과: {len(results)}개")
        
        for i, result in enumerate(results[:5]):
            source = result.get('source', 'unknown')
            print(f"  {i+1}. [{source}] {result['title']}")
        
        if results:
            print("\n첫 번째 결과 상세 정보:")
            info = get_download_info(results[0]['url'])
            print(f"  제목: {info['title']}")
            print(f"  파일명: {info['filename']}")
            print(f"  다운로드 URL: {info['download_url'][:50]}..." if info['download_url'] else "  다운로드 URL: 없음")
            
    except Exception as e:
        print(f"오류: {e}")
    
    print("\n" + "=" * 50)
    print("테스트 완료!")

