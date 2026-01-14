# 🎯 아미르님 학습 플래너 Web App 개발 계획서

> Claude Code에서 개발할 맞춤형 학습 관리 애플리케이션

---

## 📋 프로젝트 개요

### 프로젝트명
**Amir's Learning Planner** (아미르 학습 플래너)

### 목적
- 2026-2028 학습 목표 관리
- 일일/주간/월간 진행률 추적
- AI, 회계, 영어 학습 통합 관리

### 기술 스택
```
Frontend: React (Single Page Application)
Styling: Tailwind CSS
State: React Hooks (useState, useEffect)
Storage: localStorage (브라우저 로컬 저장)
Build: Vite
Deployment: GitHub Pages (선택사항)
```

---

## 🎯 핵심 기능 요구사항

### 1. 메인 대시보드
**기능:**
- 오늘 날짜 자동 표시
- 오늘 할 일 체크박스 (AI 1.5h, 회계 1.5h, 영어 1h)
- 이번 주 진행률 바 (목표 대비 실제 시간)
- 이번 달 주요 목표 표시
- 누적 통계 (총 학습 시간, 프로젝트 개수 등)

**UI 요구사항:**
- 모바일 최적화 (반응형)
- 클릭 한 번으로 체크
- 진행률 바 시각화
- 달성 시 초록색 하이라이트

---

### 2. 주간 플래너
**기능:**
- 월~토 일별 체크리스트
- 일요일은 휴식/회고
- 실제 학습 시간 입력
- 주간 통계 자동 계산
- 주간 회고 작성 영역

**데이터 구조:**
```javascript
weeklyData = {
  weekNumber: 1,
  startDate: "2026-01-13",
  goals: {
    ai: 9.5,
    accounting: 8.5,
    english: 6.5
  },
  days: [
    {
      date: "2026-01-13",
      ai: { completed: true, hours: 1.5 },
      accounting: { completed: true, hours: 1.5 },
      english: { completed: true, hours: 1.0 },
      note: "오늘 배운 것"
    },
    // ... 6 more days
  ],
  retrospective: "이번 주 회고 내용"
}
```

---

### 3. AI 프로젝트 트래커
**기능:**
- 프로젝트 목록 (계획중/진행중/완료)
- 프로젝트 상세 정보 입력
- 진행 상태 관리
- GitHub 링크 연결
- 완료 프로젝트 갤러리

**프로젝트 데이터 구조:**
```javascript
project = {
  id: 1,
  name: "PDF 자동 분류 시스템",
  status: "진행중", // 계획중, 진행중, 완료
  startDate: "2026-01-13",
  endDate: null,
  hoursSpent: 10,
  difficulty: 3, // 1-5
  technologies: ["Claude Skills", "Python"],
  features: ["PDF 업로드", "자동 분류", "결과 저장"],
  githubUrl: "",
  description: "프로젝트 설명",
  learnings: "배운 것들",
  challenges: "어려웠던 점"
}
```

---

### 4. 회계 학습 관리
**기능:**
- 전산회계 2급/1급 진도 관리
- 챕터별 완료 체크
- 문제 풀이 기록
- 시험 D-Day 카운터
- 모의고사 점수 그래프

**데이터 구조:**
```javascript
accounting = {
  level2: {
    chapters: [
      {
        number: 1,
        title: "회계의 기초",
        pages: "1-50",
        completed: true,
        completedDate: "2026-01-15",
        understanding: 4 // 1-5
      },
      // more chapters
    ],
    practiceTests: [
      {
        date: "2026-01-20",
        type: "기출문제",
        year: "2023년 1회",
        score: 75,
        wrongTopics: ["부가가치세", "결산"]
      }
    ],
    examDate: "2026-06-15"
  },
  level1: {
    // similar structure
  }
}
```

---

### 5. 영어 학습 기록
**기능:**
- Speak 앱 일일 체크
- 새로운 표현 노트
- 레벨 진행 기록
- 독서 목록 (Magic Tree House 등)
- 대화 연습 기록

**데이터 구조:**
```javascript
english = {
  speakApp: {
    currentLevel: "Study Abroad Prep",
    streak: 45, // 연속 일수
    ranking: "Top 30%"
  },
  expressions: [
    {
      id: 1,
      phrase: "I hope this email finds you well",
      meaning: "안부 인사",
      category: "이메일",
      example: "예문...",
      practiced: true,
      addedDate: "2026-01-13"
    }
  ],
  books: [
    {
      title: "Magic Tree House #1",
      startDate: "2026-01-10",
      endDate: "2026-01-15",
      difficulty: 2
    }
  ]
}
```

---

### 6. 2026-2028 로드맵
**기능:**
- 분기별 목표 표시
- Q1, Q2, Q3, Q4 탭
- 마일스톤 체크리스트
- 진행률 시각화
- 연도별 전환

**데이터 구조:**
```javascript
roadmap = {
  year: 2026,
  quarters: {
    Q1: {
      ai: {
        title: "기초 확립",
        milestones: [
          { task: "GitHub 계정 생성", completed: true },
          { task: "MCP 개념 이해", completed: false },
          { task: "n8n 워크플로우 3개", completed: false }
        ]
      },
      accounting: { /* similar */ },
      english: { /* similar */ }
    },
    // Q2, Q3, Q4
  }
}
```

---

## 🎨 UI/UX 디자인 가이드

### 색상 테마
```css
Primary: #3B82F6 (파란색 - 신뢰감)
Success: #10B981 (초록색 - 완료)
Warning: #F59E0B (주황색 - 진행중)
Danger: #EF4444 (빨강색 - 계획중)
Background: #F9FAFB (밝은 회색)
Dark Mode: #1F2937 (다크 그레이)
```

### 레이아웃
```
모바일 우선 (Mobile First)
- 작은 화면: 단일 컬럼
- 태블릿: 2컬럼
- 데스크톱: 3컬럼 (대시보드 + 상세)

네비게이션:
- 하단 탭 바 (모바일)
- 좌측 사이드바 (데스크톱)
```

### 컴포넌트 구조
```
src/
├── components/
│   ├── Dashboard/
│   │   ├── TodayTasks.jsx
│   │   ├── WeeklyProgress.jsx
│   │   ├── MonthlyGoals.jsx
│   │   └── Statistics.jsx
│   ├── WeeklyPlanner/
│   │   ├── DayCard.jsx
│   │   ├── WeeklyStats.jsx
│   │   └── Retrospective.jsx
│   ├── AIProjects/
│   │   ├── ProjectList.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectForm.jsx
│   │   └── ProjectDetail.jsx
│   ├── Accounting/
│   │   ├── ChapterList.jsx
│   │   ├── PracticeLog.jsx
│   │   └── ExamCounter.jsx
│   ├── English/
│   │   ├── SpeakAppTracker.jsx
│   │   ├── ExpressionNote.jsx
│   │   └── BookList.jsx
│   ├── Roadmap/
│   │   ├── QuarterView.jsx
│   │   ├── MilestoneList.jsx
│   │   └── ProgressBar.jsx
│   └── common/
│       ├── Checkbox.jsx
│       ├── ProgressBar.jsx
│       ├── Button.jsx
│       └── Modal.jsx
├── hooks/
│   ├── useLocalStorage.js
│   ├── useWeeklyData.js
│   └── useProgress.js
├── utils/
│   ├── dateHelpers.js
│   ├── calculations.js
│   └── dataInitializer.js
└── App.jsx
```

---

## 📝 개발 단계별 작업 계획

### Phase 1: 프로젝트 초기 설정 (30분)
**작업 내용:**
```bash
# 1. Vite + React 프로젝트 생성
npm create vite@latest amir-learning-planner -- --template react

# 2. 필요한 패키지 설치
cd amir-learning-planner
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react  # 아이콘
npm install date-fns      # 날짜 처리

# 3. Tailwind CSS 설정
npx tailwindcss init -p
```

**Tailwind 설정 (tailwind.config.js):**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      }
    },
  },
  plugins: [],
}
```

**결과물:**
- ✅ 빈 React 앱 실행됨
- ✅ Tailwind CSS 작동 확인

---

### Phase 2: 데이터 구조 및 Storage 구현 (1시간)

**파일: src/utils/dataInitializer.js**
```javascript
export const initialData = {
  user: {
    name: "아미르",
    startDate: "2026-01-13",
    timezone: "Asia/Seoul"
  },
  dailyGoals: {
    ai: 1.5,
    accounting: 1.5,
    english: 1.0
  },
  weeklyGoals: {
    ai: 9.5,
    accounting: 8.5,
    english: 6.5
  },
  currentWeek: {
    // 주간 데이터
  },
  projects: [],
  accounting: {
    level2: { chapters: [], tests: [], examDate: "2026-06-15" },
    level1: { chapters: [], tests: [], examDate: "2026-12-15" }
  },
  english: {
    speakApp: {},
    expressions: [],
    books: []
  },
  roadmap: {
    2026: { /* 분기별 목표 */ }
  }
};
```

**파일: src/hooks/useLocalStorage.js**
```javascript
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

**결과물:**
- ✅ 데이터 구조 정의 완료
- ✅ localStorage 저장/불러오기 작동
- ✅ 초기 데이터 자동 생성

---

### Phase 3: 메인 대시보드 개발 (2시간)

**3-1. 오늘 할 일 컴포넌트**

**파일: src/components/Dashboard/TodayTasks.jsx**
```javascript
import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function TodayTasks({ tasks, onToggle }) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2">📊 오늘 할 일</h2>
      <p className="text-gray-600 mb-4">{today}</p>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskItem 
            key={task.id}
            task={task}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle }) {
  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
        ${task.completed 
          ? 'bg-green-50 border-green-500' 
          : 'bg-gray-50 border-gray-200 hover:border-blue-500'
        }`}
      onClick={() => onToggle(task.id)}
    >
      <div className="flex items-center space-x-3">
        {task.completed ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : (
          <Circle className="w-6 h-6 text-gray-400" />
        )}
        <div>
          <p className="font-semibold">{task.emoji} {task.name}</p>
          <p className="text-sm text-gray-600">{task.duration}</p>
        </div>
      </div>
      {task.completed && (
        <span className="text-green-600 font-bold">✓ 완료!</span>
      )}
    </div>
  );
}
```

**3-2. 주간 진행률 바**

**파일: src/components/Dashboard/WeeklyProgress.jsx**
```javascript
import React from 'react';

export default function WeeklyProgress({ weekly }) {
  const subjects = [
    { key: 'ai', name: 'AI', emoji: '🤖', color: 'blue' },
    { key: 'accounting', name: '회계', emoji: '📊', color: 'purple' },
    { key: 'english', name: '영어', emoji: '🗣️', color: 'green' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">📈 이번 주 진행률</h2>
      
      <div className="space-y-4">
        {subjects.map(subject => {
          const actual = weekly[subject.key].actual || 0;
          const goal = weekly[subject.key].goal;
          const percentage = Math.min(100, (actual / goal) * 100);
          
          return (
            <div key={subject.key}>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">
                  {subject.emoji} {subject.name}
                </span>
                <span className="text-sm text-gray-600">
                  {actual.toFixed(1)}h / {goal}h ({percentage.toFixed(0)}%)
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`bg-${subject.color}-500 h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**3-3. 월간 목표**

**파일: src/components/Dashboard/MonthlyGoals.jsx**
```javascript
import React from 'react';

export default function MonthlyGoals({ goals }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">🎯 이번 달 목표</h2>
      
      <div className="space-y-3">
        {goals.map(goal => (
          <div 
            key={goal.id}
            className={`flex items-start space-x-3 p-3 rounded-lg
              ${goal.completed ? 'bg-green-50' : 'bg-gray-50'}`}
          >
            <span className="text-2xl">
              {goal.completed ? '✅' : '⬜'}
            </span>
            <div className="flex-1">
              <p className="font-medium">{goal.title}</p>
              {goal.progress && (
                <p className="text-sm text-gray-600 mt-1">
                  진행률: {goal.progress}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**결과물:**
- ✅ 오늘 할 일 체크 작동
- ✅ 주간 진행률 바 표시
- ✅ 월간 목표 확인 가능

---

### Phase 4: 주간 플래너 개발 (1.5시간)

**파일: src/components/WeeklyPlanner/WeeklyPlanner.jsx**
```javascript
import React from 'react';
import DayCard from './DayCard';
import WeeklyStats from './WeeklyStats';
import Retrospective from './Retrospective';

export default function WeeklyPlanner({ weekData, onUpdate }) {
  const days = ['월', '화', '수', '목', '금', '토'];
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">📅 주간 플래너</h2>
        <p className="text-gray-600">
          {weekData.startDate} ~ {weekData.endDate}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day, index) => (
          <DayCard 
            key={index}
            day={day}
            data={weekData.days[index]}
            onUpdate={(data) => onUpdate(index, data)}
          />
        ))}
        
        <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold mb-2">🌴 일요일</h3>
          <p className="text-gray-600">완전 휴식</p>
          <p className="text-sm text-gray-500 mt-2">
            가족 시간, 조깅, 회고 작성
          </p>
        </div>
      </div>

      <WeeklyStats weekData={weekData} />
      <Retrospective 
        value={weekData.retrospective}
        onChange={(value) => onUpdate('retrospective', value)}
      />
    </div>
  );
}
```

**파일: src/components/WeeklyPlanner/DayCard.jsx**
```javascript
import React from 'react';

export default function DayCard({ day, data, onUpdate }) {
  const subjects = [
    { key: 'ai', name: 'AI', duration: '1.5h', emoji: '🤖' },
    { key: 'accounting', name: '회계', duration: '1.5h', emoji: '📊' },
    { key: 'english', name: '영어', duration: '1h', emoji: '🗣️' }
  ];

  const allCompleted = subjects.every(s => data[s.key]?.completed);

  return (
    <div className={`rounded-lg p-4 border-2 ${
      allCompleted 
        ? 'bg-green-50 border-green-500' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className="text-lg font-bold mb-3">
        {day}요일 {data.date && `(${data.date.split('-')[2]}일)`}
      </h3>

      <div className="space-y-2">
        {subjects.map(subject => (
          <label 
            key={subject.key}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={data[subject.key]?.completed || false}
              onChange={(e) => {
                onUpdate({
                  ...data,
                  [subject.key]: {
                    ...data[subject.key],
                    completed: e.target.checked,
                    hours: e.target.checked ? parseFloat(subject.duration) : 0
                  }
                });
              }}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm">
              {subject.emoji} {subject.name} ({subject.duration})
            </span>
          </label>
        ))}
      </div>

      {allCompleted && (
        <div className="mt-3 text-center">
          <span className="text-green-600 font-bold">✨ 완벽!</span>
        </div>
      )}
    </div>
  );
}
```

**결과물:**
- ✅ 주간 일별 체크 가능
- ✅ 완료 시 시각적 피드백
- ✅ 주간 통계 자동 계산

---

### Phase 5: AI 프로젝트 관리 (1.5시간)

**파일: src/components/AIProjects/ProjectList.jsx**
```javascript
import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import { Plus } from 'lucide-react';

export default function ProjectList({ projects, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('전체');

  const filtered = filter === '전체' 
    ? projects 
    : projects.filter(p => p.status === filter);

  const statusCounts = {
    전체: projects.length,
    계획중: projects.filter(p => p.status === '계획중').length,
    진행중: projects.filter(p => p.status === '진행중').length,
    완료: projects.filter(p => p.status === '완료').length
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🤖 AI 프로젝트</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            <span>새 프로젝트</span>
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {status} ({count})
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <ProjectForm 
          onSave={(project) => {
            onAdd(project);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {filter === '전체' 
            ? '프로젝트를 추가해보세요!' 
            : `${filter} 프로젝트가 없습니다.`
          }
        </div>
      )}
    </div>
  );
}
```

**결과물:**
- ✅ 프로젝트 추가/수정/삭제
- ✅ 상태별 필터링
- ✅ 포트폴리오 관리

---

### Phase 6: 회계 & 영어 컴포넌트 (1시간)

**간단히 구현:**
- 회계: 챕터 체크리스트, 시험 카운터
- 영어: 일일 체크, 표현 노트

---

### Phase 7: 로드맵 뷰 (1시간)

**분기별 목표 체크리스트 형태로 구현**

---

### Phase 8: 모바일 최적화 & 테스트 (1시간)

**반응형 레이아웃 확인**
**localStorage 저장 테스트**
**다크모드 (선택사항)**

---

## 🚀 배포 방법

### GitHub Pages 배포
```bash
# package.json에 추가
{
  "homepage": "https://yourusername.github.io/amir-learning-planner",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# 배포
npm install -D gh-pages
npm run deploy
```

---

## 📱 사용 방법

### 로컬 개발
```bash
npm run dev
→ http://localhost:5173
```

### 북마크로 바로 접속
```
1. 배포된 URL을 브라우저 북마크에 저장
2. 모바일 홈 화면에 추가
3. 앱처럼 사용!
```

---

## 🎯 완성 후 기능

### ✅ 핵심 기능
- 오늘 할 일 체크 (3초)
- 주간 진행률 확인 (한눈에)
- 프로젝트 추가 (1분)
- 회계 진도 체크
- 영어 학습 기록
- 로드맵 확인

### ✅ 자동화
- 날짜 자동 계산
- 진행률 자동 계산
- 통계 자동 업데이트
- 데이터 자동 저장

### ✅ 사용성
- 모바일 완벽 지원
- 빠른 로딩
- 오프라인 작동
- 직관적인 UI

---

## 📝 Claude Code 작업 지시사항

### 작업 폴더 구조
```
amir-learning-planner/
├── README.md (이 파일)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── components/
    ├── hooks/
    └── utils/
```

### Claude Code에게 전달할 프롬프트

```
이 프로젝트는 아미르님의 2026-2028 학습 목표 관리를 위한 Web App입니다.

요구사항:
1. React + Vite + Tailwind CSS로 구현
2. localStorage로 데이터 저장 (백엔드 없음)
3. 모바일 우선 반응형 디자인
4. 6개 주요 페이지: 대시보드, 주간 플래너, AI 프로젝트, 회계, 영어, 로드맵

위의 상세 계획서를 참고하여 단계별로 개발해주세요.
Phase 1부터 시작하여 각 단계를 완료한 후 다음 단계로 진행합니다.

먼저 Phase 1 (프로젝트 초기 설정)부터 시작해주세요.
```

---

## 🎉 예상 개발 시간

- **Phase 1**: 30분 (초기 설정)
- **Phase 2**: 1시간 (데이터 구조)
- **Phase 3**: 2시간 (대시보드)
- **Phase 4**: 1.5시간 (주간 플래너)
- **Phase 5**: 1.5시간 (AI 프로젝트)
- **Phase 6**: 1시간 (회계/영어)
- **Phase 7**: 1시간 (로드맵)
- **Phase 8**: 1시간 (최적화)

**총 예상 시간: 9-10시간**

Claude Code와 함께라면 더 빠를 수 있습니다!

---

## 💡 개발 팁

1. **단계별 확인**: 각 Phase 완료 후 `npm run dev`로 확인
2. **데이터 먼저**: Phase 2에서 데이터 구조를 확실히 잡기
3. **컴포넌트 재사용**: 공통 컴포넌트는 common/ 폴더에
4. **Git 커밋**: 각 Phase 완료 시 커밋
5. **모바일 테스트**: 개발자 도구에서 모바일 뷰 확인

---

## 🎯 성공 기준

### MVP (Minimum Viable Product)
- ✅ 오늘 할 일 체크 가능
- ✅ 데이터 localStorage 저장
- ✅ 모바일에서 작동

### 완성본
- ✅ 6개 페이지 모두 작동
- ✅ 반응형 완벽
- ✅ 통계 자동 계산
- ✅ GitHub Pages 배포

---

**이 계획서를 Claude Code 작업 폴더에 넣고 시작하세요!** 🚀

**질문이나 수정 필요한 부분 있으면 언제든 말씀해주세요!**
