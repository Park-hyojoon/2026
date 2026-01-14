export const initialData = {
    user: {
        name: "아미르",
        startDate: new Date().toISOString().split('T')[0],
        timezone: "Asia/Seoul",
        language: "ko", // ko or en
        showStrategy: true
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
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            ai: { completed: false, hours: 0 },
            accounting: { completed: false, hours: 0 },
            english: { completed: false, hours: 0 },
            note: ""
        })),
        retrospective: ""
    },
    projects: [],
    accounting: {
        level2: {
            chapters: [
                { id: 1, title: "회계의 기초", completed: false, understanding: 0 },
                { id: 2, title: "자산/부채/자본", completed: false, understanding: 0 },
            ],
            tests: [],
            examDate: "2026-06-15",
            referenceMaterials: []
        },
        level1: {
            chapters: [],
            tests: [],
            examDate: "2026-12-15"
        },
        textbook: {
            name: "",
            publisher: "",
            level: "",
            features: ""
        },
        studyLog: []
    },
    english: {
        speakApp: { streak: 0, currentLevel: "Beginner" },
        expressions: [],
        books: [],
        targetPhrases: [],
        practiceHistory: []
    },
    roadmap: {
        2026: {
            Q1: { ai: "기초 학습", accounting: "전산회계 2급 이론", english: "기본 회화" }
        }
    },
    settings: {
        savePath: `amir-learning-planner/data/${new Date().getFullYear()}`
    }
};
