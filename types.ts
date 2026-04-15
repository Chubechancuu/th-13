export type UserProfile = {
  name: string;
  avatar?: string;
  year: number;
  major: string;
  gpa: number;
  goalGPA: number;
  careerGoal: string;
  xp: number;
  level: number;
  streak: number;
  lastActive?: number;
  focusTime: number; // in minutes
  completedTasks: number;
  interests: string[];
  email?: string;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  studyPreferences: {
    pomodoroFocus: boolean;
    notifications: boolean;
    autoRearrange: boolean;
  };
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  category: 'study' | 'personal' | 'career';
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
};

export type PomodoroSettings = {
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  rounds: number;
  autoStart: boolean;
  sound: 'none' | 'rain' | 'cafe' | 'white-noise';
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  mode?: 'quick' | 'deep' | 'practice' | 'summary';
};

export type ArenaSession = {
  id: string;
  type: 'internship' | 'interview';
  role: string;
  industry: string;
  company?: string;
  scenario?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'stress';
  messages: { role: 'user' | 'ai', content: string }[];
  status: 'active' | 'completed';
  feedback?: {
    score: number;
    tips: string[];
    confidence: number;
  };
};

export type Milestone = {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  skills: string[];
  certificates?: string[];
};

export type RoadmapPlan = {
  id: string;
  title: string;
  description: string;
  milestones: Milestone[];
  completedMilestones: string[];
};

export type StudyPlan = {
  id: string;
  subject: string;
  dailyTasks: {
    id: string;
    text: string;
    completed: boolean;
    startTime?: string;
    endTime?: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  weeklyGoals: string[];
  examDate?: string;
  progress: number;
  gpaTarget?: number;
  isExamRush: boolean;
};

export type DailyTask = {
  id: string;
  text: string;
  completed: boolean;
  startTime?: string;
  endTime?: string;
  priority: 'low' | 'medium' | 'high';
};

export type Challenge = {
  id: string;
  level: 'easy' | 'medium' | 'hard' | 'exam';
  type: 'multiple-choice' | 'essay' | 'fill-in-the-blank' | 'matching' | 'case-study';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
};

export type SubjectContent = {
  id: string;
  title: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    content: string;
    examples: string[];
    summary: string;
    keyConcepts: string[];
  }[];
  challenges: Challenge[];
  stats: {
    xpEarned: number;
    badges: string[];
    completedLessons: string[];
  };
};
