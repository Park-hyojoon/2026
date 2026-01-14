# Amir Learning Planner: Advanced Web App Roadmap

This plan outlines the strategic development of a personal learning management system, designed to grow from a simple tracker into an AI-powered personal coach.

## User Review Required

> [!IMPORTANT]
> **API Keys**: Implementing AI quizzes and coaching will require an API key (e.g., Gemini or OpenAI). We will start with local mock-ups and integrate the real AI later.
> **Data Portability**: Since we start with `localStorage`, clearing your browser cache could data. In later phases, we'll discuss "Export/Import" features.

## Proposed Changes

### [Phase 1: Foundation (The "Tracker")]
- **Goal**: Establish a responsive UI that works on Mobile, Tablet, and Desktop.
- **Key Features**: 
  - Dynamic Dashboard (Today's 1.5h/1.5h/1h goals).
  - Subject Management: UI to easily change time goals or subjects.
  - Mobile-first layout using Tailwind CSS Flex/Grid.

### [Phase 2: Data Flexibility (The "Settings")]
- **Goal**: Allow users to modify plans without touching code.
- **Key Features**:
  - Implementation of a "Settings" page to edit target hours, Exam dates, and Roadmap milestones.
  - State management sync across the whole app.

### [Phase 3: AI Accounting Agent (The "Quizzer")]
- **Goal**: AI-driven weekly quizzes for "Computerized Accounting."
- **Key Features**:
  - Integration of an AI module (Agent) that reviews the week's study record.
  - Generation of 3-5 "Pop Quiz" questions based on the recorded progress.
  - Feedback loop: Grading and clarifying wrong answers.

### [Phase 4: AI English Coach (The "Reviewer")]
- **Goal**: Proactive feedback on English study patterns.
- **Key Features**:
  - AI analysis of study logs: "Are you practicing enough speaking?" "Is it time for a vocabulary review?"
  - Suggesting "Weekly Challenges" based on the user's current level (B2 target).

## Verification Plan

### Automated Progress
- **Responsive Testing**: Using browser subagent to verify layout on 375px (iPhone) and 1024px (iPad) widths.
- **AI Logic**: Mocking AI responses to verify the grading system.

### Manual Verification
- **User Feel**: Confirming that changing a goal on the "Settings" page instantly reflects on the Dashboard.
- **Quiz Flow**: Testing a complete cycle from Quiz generation to Result viewing.
