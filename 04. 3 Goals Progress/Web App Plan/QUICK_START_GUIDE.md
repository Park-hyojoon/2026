# ⚡ Claude Code 빠른 시작 가이드

> 5분 안에 프로젝트 시작하기

---

## 🚀 Step 1: 프로젝트 폴더 만들기 (1분)

### Windows
```bash
# 원하는 위치에서 (예: 바탕화면)
mkdir amir-learning-planner
cd amir-learning-planner
```

### Mac/Linux
```bash
mkdir ~/amir-learning-planner
cd ~/amir-learning-planner
```

---

## 📝 Step 2: 계획서 복사 (1분)

```
1. CLAUDE_CODE_PROJECT_PLAN.md 파일을 폴더에 복사
2. 파일명을 README.md로 변경
```

---

## 🤖 Step 3: Claude Code 실행 (1분)

### VS Code에서
```bash
# 터미널에서
code .

# VS Code가 열리면
# Ctrl+Shift+P (또는 Cmd+Shift+P)
# "Claude Code" 검색
# "Start Claude Code Session" 선택
```

### 터미널에서
```bash
# Claude Code CLI가 설치되어 있다면
claude-code
```

---

## 💬 Step 4: Claude Code에게 지시 (2분)

### 프롬프트 복사해서 입력:

```
안녕! 아미르님의 학습 플래너 Web App을 만들어야 해.

현재 폴더에 README.md 파일이 있어. 
이 파일을 읽고 프로젝트 계획을 파악한 후,
Phase 1 (프로젝트 초기 설정)부터 시작해줘.

요구사항:
- React + Vite + Tailwind CSS
- localStorage로 데이터 저장
- 모바일 우선 반응형 디자인

README.md의 Phase 1부터 차례대로 진행하면 돼.
각 단계 완료 후 다음 단계로 넘어가자.

시작해도 될까?
```

---

## ✅ Step 5: 단계별 진행

### Phase 1 완료 후
```
Claude Code가 자동으로:
✅ package.json 생성
✅ Vite 설정
✅ Tailwind CSS 설정
✅ 기본 폴더 구조

확인:
npm run dev
→ http://localhost:5173 접속
```

### Phase 2-8 진행
```
Claude Code에게:
"Phase 2 진행해줘"
"Phase 3 진행해줘"
...
```

### 막히면
```
"지금까지 잘 되고 있어?"
"다음 단계로 넘어가도 될까?"
"에러가 나는데 확인해줘"
```

---

## 🎯 완성 확인

### 로컬 실행
```bash
npm run dev
```

### 테스트 항목
- [ ] 오늘 할 일 체크박스 작동
- [ ] 체크하면 초록색으로 변경
- [ ] 새로고침 해도 데이터 유지
- [ ] 모바일 크기에서 잘 보임

---

## 📱 배포하기 (선택사항)

### GitHub Pages
```bash
# 1. GitHub 레포지토리 만들기
# 2. 코드 푸시
git init
git add .
git commit -m "Initial commit"
git remote add origin [your-repo-url]
git push -u origin main

# 3. 배포
npm install -D gh-pages
npm run deploy
```

---

## 🆘 문제 해결

### Q: Node.js가 없어요
```
nodejs.org에서 다운로드
→ LTS 버전 설치
→ 터미널 재시작
```

### Q: Claude Code가 없어요
```
VS Code Extensions에서:
"Claude Code" 검색 및 설치
```

### Q: npm 명령어가 안 돼요
```
Node.js 설치 확인:
node --version
npm --version

안 나오면 재설치
```

### Q: 포트 충돌 나요
```
vite.config.js에서:
export default {
  server: {
    port: 3000  // 다른 포트로 변경
  }
}
```

---

## 💡 개발 팁

### 자주 쓰는 명령어
```bash
npm run dev        # 개발 서버 시작
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
```

### 브라우저 개발자 도구
```
F12 또는 Ctrl+Shift+I
→ Console 탭에서 에러 확인
→ Application > Local Storage에서 데이터 확인
```

### 데이터 초기화
```javascript
// 브라우저 Console에서
localStorage.clear()
→ 새로고침
```

---

## 🎉 완성!

### 이제 할 수 있는 것:
- ✅ 매일 체크박스 체크
- ✅ 주간 진행률 확인
- ✅ AI 프로젝트 관리
- ✅ 회계/영어 학습 기록
- ✅ 로드맵 추적

### 사용 방법:
1. 북마크에 URL 저장
2. 모바일 홈 화면에 추가
3. 매일 아침 확인
4. 저녁에 체크

---

## 📞 도움이 필요하면

Claude에게 물어보세요:
- "에러가 나요"
- "이 기능 추가하고 싶어요"
- "디자인 바꾸고 싶어요"
- "배포 어떻게 해요"

**항상 도와드릴게요!** 😊

---

**지금 바로 시작하세요!** 🚀

Step 1부터 차근차근 따라하면 
9-10시간 후에 완성된 앱을 쓸 수 있어요!
