import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface Lesson {
  id: string;
  title: string;
  duration: number; // minutes
  type: 'article' | 'video' | 'quiz' | 'interactive';
}

export interface SubModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  subModules: SubModule[];
}

export interface Track {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind gradient class
  accentColor: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: Module[];
  totalLessons: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  condition: string;
}

// ═══════════════════════════════════════════
// MOCK DATA — Rich 4-Level Hierarchy
// ═══════════════════════════════════════════

const TRACKS: Track[] = [
  {
    id: 'stock-basics',
    title: 'Stock Market Basics',
    description: 'Build a rock-solid foundation in equity markets — from how exchanges work to placing your first trade.',
    icon: 'TrendingUp',
    color: 'from-emerald-500 to-teal-600',
    accentColor: '#10b981',
    difficulty: 'Beginner',
    totalLessons: 18,
    modules: [
      {
        id: 'sb-m1', title: 'What is the Stock Market?', description: 'Understand exchanges, participants, and market structure.',
        estimatedMinutes: 25,
        subModules: [
          { id: 'sb-m1-s1', title: 'How Exchanges Work', lessons: [
            { id: 'sb-m1-s1-l1', title: 'NSE vs BSE: A Brief History', duration: 5, type: 'article' },
            { id: 'sb-m1-s1-l2', title: 'Order Matching Engines', duration: 4, type: 'article' },
            { id: 'sb-m1-s1-l3', title: 'Knowledge Check', duration: 3, type: 'quiz' },
          ]},
          { id: 'sb-m1-s2', title: 'Market Participants', lessons: [
            { id: 'sb-m1-s2-l1', title: 'Retail vs Institutional Investors', duration: 5, type: 'article' },
            { id: 'sb-m1-s2-l2', title: 'Role of SEBI', duration: 4, type: 'article' },
            { id: 'sb-m1-s2-l3', title: 'Interactive: Map the Market', duration: 4, type: 'interactive' },
          ]},
        ]
      },
      {
        id: 'sb-m2', title: 'Your First Trade', description: 'Learn order types, lot sizes, and execution mechanics.',
        estimatedMinutes: 30,
        subModules: [
          { id: 'sb-m2-s1', title: 'Types of Orders', lessons: [
            { id: 'sb-m2-s1-l1', title: 'Market Orders vs Limit Orders', duration: 6, type: 'article' },
            { id: 'sb-m2-s1-l2', title: 'Stop-Loss & GTT Orders', duration: 6, type: 'article' },
            { id: 'sb-m2-s1-l3', title: 'Simulate: Place a Trade', duration: 8, type: 'interactive' },
          ]},
          { id: 'sb-m2-s2', title: 'Reading a Ticker', lessons: [
            { id: 'sb-m2-s2-l1', title: 'Bid, Ask, and Spread', duration: 5, type: 'article' },
            { id: 'sb-m2-s2-l2', title: 'Volume & Open Interest', duration: 5, type: 'video' },
          ]},
        ]
      },
      {
        id: 'sb-m3', title: 'IPOs & Listings', description: 'How companies go public and what it means for you.',
        estimatedMinutes: 20,
        subModules: [
          { id: 'sb-m3-s1', title: 'The IPO Process', lessons: [
            { id: 'sb-m3-s1-l1', title: 'From Private to Public', duration: 5, type: 'article' },
            { id: 'sb-m3-s1-l2', title: 'Underwriting & Book Building', duration: 5, type: 'article' },
            { id: 'sb-m3-s1-l3', title: 'IPO Quiz', duration: 3, type: 'quiz' },
          ]},
        ]
      },
    ]
  },
  {
    id: 'technical-analysis',
    title: 'Technical Analysis',
    description: 'Master chart reading, indicators, and pattern recognition to time the market like a professional.',
    icon: 'BarChart3',
    color: 'from-indigo-500 to-violet-600',
    accentColor: '#6366f1',
    difficulty: 'Intermediate',
    totalLessons: 24,
    modules: [
      {
        id: 'ta-m1', title: 'Candlestick Patterns', description: 'Read price action through Japanese candlestick formations.',
        estimatedMinutes: 35,
        subModules: [
          { id: 'ta-m1-s1', title: 'Single Candle Patterns', lessons: [
            { id: 'ta-m1-s1-l1', title: 'Doji, Hammer & Shooting Star', duration: 6, type: 'article' },
            { id: 'ta-m1-s1-l2', title: 'Marubozu & Spinning Top', duration: 5, type: 'article' },
            { id: 'ta-m1-s1-l3', title: 'Pattern Recognition Drill', duration: 5, type: 'interactive' },
          ]},
          { id: 'ta-m1-s2', title: 'Multi-Candle Patterns', lessons: [
            { id: 'ta-m1-s2-l1', title: 'Engulfing & Harami', duration: 6, type: 'article' },
            { id: 'ta-m1-s2-l2', title: 'Morning & Evening Star', duration: 6, type: 'article' },
            { id: 'ta-m1-s2-l3', title: 'Spot the Pattern Quiz', duration: 4, type: 'quiz' },
          ]},
        ]
      },
      {
        id: 'ta-m2', title: 'Moving Averages & MACD', description: 'Use trend-following indicators to identify market direction.',
        estimatedMinutes: 30,
        subModules: [
          { id: 'ta-m2-s1', title: 'Moving Averages', lessons: [
            { id: 'ta-m2-s1-l1', title: 'SMA vs EMA Explained', duration: 6, type: 'article' },
            { id: 'ta-m2-s1-l2', title: 'Golden & Death Cross', duration: 5, type: 'video' },
          ]},
          { id: 'ta-m2-s2', title: 'MACD Deep Dive', lessons: [
            { id: 'ta-m2-s2-l1', title: 'MACD Line, Signal & Histogram', duration: 7, type: 'article' },
            { id: 'ta-m2-s2-l2', title: 'Divergences & Convergences', duration: 6, type: 'article' },
            { id: 'ta-m2-s2-l3', title: 'MACD Trading Simulation', duration: 6, type: 'interactive' },
          ]},
        ]
      },
      {
        id: 'ta-m3', title: 'Support, Resistance & Fibonacci', description: 'Draw levels and use Fibonacci retracements for entries.',
        estimatedMinutes: 30,
        subModules: [
          { id: 'ta-m3-s1', title: 'Support & Resistance', lessons: [
            { id: 'ta-m3-s1-l1', title: 'Drawing Key Levels', duration: 5, type: 'article' },
            { id: 'ta-m3-s1-l2', title: 'Breakouts vs Fakeouts', duration: 5, type: 'article' },
          ]},
          { id: 'ta-m3-s2', title: 'Fibonacci Tools', lessons: [
            { id: 'ta-m3-s2-l1', title: 'Fibonacci Retracement Levels', duration: 6, type: 'article' },
            { id: 'ta-m3-s2-l2', title: 'Fibonacci Extensions', duration: 5, type: 'article' },
            { id: 'ta-m3-s2-l3', title: 'Draw It Yourself Exercise', duration: 4, type: 'interactive' },
          ]},
        ]
      },
    ]
  },
  {
    id: 'fundamental-analysis',
    title: 'Fundamental Analysis',
    description: 'Evaluate companies by dissecting financial statements, ratios, and intrinsic value models.',
    icon: 'Calculator',
    color: 'from-amber-500 to-orange-600',
    accentColor: '#f59e0b',
    difficulty: 'Intermediate',
    totalLessons: 20,
    modules: [
      {
        id: 'fa-m1', title: 'Reading Financial Statements', description: 'Decode P&L, Balance Sheet, and Cash Flow statements.',
        estimatedMinutes: 40,
        subModules: [
          { id: 'fa-m1-s1', title: 'Income Statement', lessons: [
            { id: 'fa-m1-s1-l1', title: 'Revenue, EBITDA & Net Profit', duration: 7, type: 'article' },
            { id: 'fa-m1-s1-l2', title: 'Margins That Matter', duration: 5, type: 'article' },
          ]},
          { id: 'fa-m1-s2', title: 'Balance Sheet', lessons: [
            { id: 'fa-m1-s2-l1', title: 'Assets, Liabilities & Equity', duration: 6, type: 'article' },
            { id: 'fa-m1-s2-l2', title: 'Debt-to-Equity Decoded', duration: 5, type: 'article' },
            { id: 'fa-m1-s2-l3', title: 'Balance Sheet Quiz', duration: 4, type: 'quiz' },
          ]},
          { id: 'fa-m1-s3', title: 'Cash Flow Statement', lessons: [
            { id: 'fa-m1-s3-l1', title: 'Operating vs Free Cash Flow', duration: 6, type: 'article' },
            { id: 'fa-m1-s3-l2', title: 'Why Cash Is King', duration: 5, type: 'video' },
          ]},
        ]
      },
      {
        id: 'fa-m2', title: 'Valuation Ratios', description: 'Master PE, PB, ROE, ROCE and other critical ratios.',
        estimatedMinutes: 30,
        subModules: [
          { id: 'fa-m2-s1', title: 'Price Ratios', lessons: [
            { id: 'fa-m2-s1-l1', title: 'P/E Ratio: The King of Ratios', duration: 6, type: 'article' },
            { id: 'fa-m2-s1-l2', title: 'P/B Ratio & EV/EBITDA', duration: 6, type: 'article' },
          ]},
          { id: 'fa-m2-s2', title: 'Efficiency Ratios', lessons: [
            { id: 'fa-m2-s2-l1', title: 'ROE vs ROCE', duration: 6, type: 'article' },
            { id: 'fa-m2-s2-l2', title: 'Ratio Comparison Tool', duration: 6, type: 'interactive' },
          ]},
        ]
      },
    ]
  },
  {
    id: 'options-derivatives',
    title: 'Options & Derivatives',
    description: 'Navigate the world of calls, puts, and complex strategies to hedge risk or amplify returns.',
    icon: 'Layers',
    color: 'from-rose-500 to-pink-600',
    accentColor: '#f43f5e',
    difficulty: 'Advanced',
    totalLessons: 22,
    modules: [
      {
        id: 'od-m1', title: 'Options 101', description: 'Understand calls, puts, premiums, and intrinsic value.',
        estimatedMinutes: 35,
        subModules: [
          { id: 'od-m1-s1', title: 'Option Basics', lessons: [
            { id: 'od-m1-s1-l1', title: 'What is an Option Contract?', duration: 6, type: 'article' },
            { id: 'od-m1-s1-l2', title: 'Call vs Put Options', duration: 6, type: 'article' },
            { id: 'od-m1-s1-l3', title: 'Intrinsic vs Time Value', duration: 5, type: 'article' },
            { id: 'od-m1-s1-l4', title: 'Options Basics Quiz', duration: 4, type: 'quiz' },
          ]},
          { id: 'od-m1-s2', title: 'Greeks 101', lessons: [
            { id: 'od-m1-s2-l1', title: 'Delta & Gamma', duration: 6, type: 'article' },
            { id: 'od-m1-s2-l2', title: 'Theta & Vega', duration: 6, type: 'article' },
            { id: 'od-m1-s2-l3', title: 'Greeks Calculator', duration: 5, type: 'interactive' },
          ]},
        ]
      },
      {
        id: 'od-m2', title: 'Options Strategies', description: 'Build multi-leg strategies for any market condition.',
        estimatedMinutes: 40,
        subModules: [
          { id: 'od-m2-s1', title: 'Bullish Strategies', lessons: [
            { id: 'od-m2-s1-l1', title: 'Bull Call Spread', duration: 6, type: 'article' },
            { id: 'od-m2-s1-l2', title: 'Strategy Builder Sim', duration: 8, type: 'interactive' },
          ]},
          { id: 'od-m2-s2', title: 'Neutral Strategies', lessons: [
            { id: 'od-m2-s2-l1', title: 'Iron Condor & Iron Butterfly', duration: 7, type: 'article' },
            { id: 'od-m2-s2-l2', title: 'Straddle vs Strangle', duration: 6, type: 'article' },
            { id: 'od-m2-s2-l3', title: 'Strategy Quiz', duration: 4, type: 'quiz' },
          ]},
        ]
      },
    ]
  },
  {
    id: 'portfolio-management',
    title: 'Portfolio Management',
    description: 'Construct, diversify, and rebalance portfolios using modern portfolio theory and asset allocation.',
    icon: 'PieChart',
    color: 'from-cyan-500 to-blue-600',
    accentColor: '#06b6d4',
    difficulty: 'Intermediate',
    totalLessons: 16,
    modules: [
      {
        id: 'pm-m1', title: 'Asset Allocation', description: 'Learn how to spread capital across asset classes.',
        estimatedMinutes: 30,
        subModules: [
          { id: 'pm-m1-s1', title: 'Diversification Basics', lessons: [
            { id: 'pm-m1-s1-l1', title: 'Why Diversification Works', duration: 5, type: 'article' },
            { id: 'pm-m1-s1-l2', title: 'Correlation Between Assets', duration: 5, type: 'article' },
            { id: 'pm-m1-s1-l3', title: 'Build Your Portfolio', duration: 6, type: 'interactive' },
          ]},
          { id: 'pm-m1-s2', title: 'Rebalancing', lessons: [
            { id: 'pm-m1-s2-l1', title: 'When & How to Rebalance', duration: 5, type: 'article' },
            { id: 'pm-m1-s2-l2', title: 'Tax-Efficient Rebalancing', duration: 5, type: 'article' },
          ]},
        ]
      },
      {
        id: 'pm-m2', title: 'Mutual Funds & ETFs', description: 'Passive investing vehicles for long-term wealth creation.',
        estimatedMinutes: 25,
        subModules: [
          { id: 'pm-m2-s1', title: 'Understanding Funds', lessons: [
            { id: 'pm-m2-s1-l1', title: 'Index Funds vs Active Funds', duration: 6, type: 'article' },
            { id: 'pm-m2-s1-l2', title: 'Expense Ratios & NAV', duration: 5, type: 'article' },
            { id: 'pm-m2-s1-l3', title: 'SIP Calculator', duration: 5, type: 'interactive' },
          ]},
          { id: 'pm-m2-s2', title: 'ETF Universe', lessons: [
            { id: 'pm-m2-s2-l1', title: 'Nifty 50 ETF Deep Dive', duration: 5, type: 'article' },
            { id: 'pm-m2-s2-l2', title: 'Sector & Thematic ETFs', duration: 5, type: 'article' },
          ]},
        ]
      },
    ]
  },
  {
    id: 'risk-psychology',
    title: 'Risk & Trading Psychology',
    description: 'Control emotions, size positions correctly, and build the mindset of consistently profitable traders.',
    icon: 'Brain',
    color: 'from-purple-500 to-fuchsia-600',
    accentColor: '#a855f7',
    difficulty: 'Beginner',
    totalLessons: 14,
    modules: [
      {
        id: 'rp-m1', title: 'Position Sizing & Risk', description: 'Never risk more than you can afford — learn the math.',
        estimatedMinutes: 25,
        subModules: [
          { id: 'rp-m1-s1', title: 'Risk Per Trade', lessons: [
            { id: 'rp-m1-s1-l1', title: 'The 2% Rule', duration: 5, type: 'article' },
            { id: 'rp-m1-s1-l2', title: 'Position Size Calculator', duration: 5, type: 'interactive' },
          ]},
          { id: 'rp-m1-s2', title: 'Risk-Reward Ratio', lessons: [
            { id: 'rp-m1-s2-l1', title: 'Setting R:R Targets', duration: 5, type: 'article' },
            { id: 'rp-m1-s2-l2', title: 'Win Rate vs R:R', duration: 5, type: 'article' },
            { id: 'rp-m1-s2-l3', title: 'R:R Simulator', duration: 5, type: 'interactive' },
          ]},
        ]
      },
      {
        id: 'rp-m2', title: 'Trading Psychology', description: 'Master your emotions — fear, greed, and FOMO.',
        estimatedMinutes: 20,
        subModules: [
          { id: 'rp-m2-s1', title: 'Common Biases', lessons: [
            { id: 'rp-m2-s1-l1', title: 'Confirmation Bias in Trading', duration: 5, type: 'article' },
            { id: 'rp-m2-s1-l2', title: 'Loss Aversion & Sunk Cost', duration: 5, type: 'article' },
          ]},
          { id: 'rp-m2-s2', title: 'Building Discipline', lessons: [
            { id: 'rp-m2-s2-l1', title: 'Creating a Trading Journal', duration: 5, type: 'article' },
            { id: 'rp-m2-s2-l2', title: 'Pre-Market Routine', duration: 4, type: 'video' },
          ]},
        ]
      },
    ]
  },
];

const DEFAULT_BADGES: Badge[] = [
  { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', unlocked: false, condition: 'Complete 1 lesson' },
  { id: 'streak-3', title: 'On Fire', description: '3-day learning streak', icon: '🔥', unlocked: false, condition: '3 consecutive days' },
  { id: 'streak-7', title: 'Unstoppable', description: '7-day learning streak', icon: '⚡', unlocked: false, condition: '7 consecutive days' },
  { id: 'streak-30', title: 'Legend', description: '30-day learning streak', icon: '👑', unlocked: false, condition: '30 consecutive days' },
  { id: 'module-complete', title: 'Module Master', description: 'Complete an entire module', icon: '📚', unlocked: false, condition: 'Finish all lessons in a module' },
  { id: 'track-complete', title: 'Track Champion', description: 'Complete an entire track', icon: '🏆', unlocked: false, condition: 'Finish all modules in a track' },
  { id: 'xp-100', title: 'Rising Star', description: 'Earn 100 XP', icon: '⭐', unlocked: false, condition: 'Accumulate 100 XP' },
  { id: 'xp-500', title: 'Knowledge Seeker', description: 'Earn 500 XP', icon: '🧠', unlocked: false, condition: 'Accumulate 500 XP' },
  { id: 'xp-1000', title: 'Market Scholar', description: 'Earn 1000 XP', icon: '🎓', unlocked: false, condition: 'Accumulate 1000 XP' },
  { id: 'speed-learner', title: 'Speed Learner', description: 'Complete 5 lessons in one day', icon: '🚀', unlocked: false, condition: '5 lessons in a single day' },
  { id: 'quiz-ace', title: 'Quiz Ace', description: 'Complete 5 quizzes', icon: '💯', unlocked: false, condition: 'Finish 5 quiz lessons' },
  { id: 'all-tracks', title: 'Finance Guru', description: 'Start all 6 tracks', icon: '🌟', unlocked: false, condition: 'Begin at least 1 lesson in each track' },
];

// ═══════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════

interface LearnState {
  // Data
  tracks: Track[];
  badges: Badge[];

  // User progress
  completedLessons: string[]; // lesson IDs
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // ISO date string (YYYY-MM-DD)
  lessonsToday: number;
  quizzesCompleted: number;
  tracksStarted: string[]; // track IDs

  // UI state
  activeTrackId: string | null;
  activeModuleId: string | null;

  // Actions
  completeLesson: (lessonId: string, trackId: string) => void;
  setActiveTrack: (trackId: string | null) => void;
  setActiveModule: (moduleId: string | null) => void;
  getTrackProgress: (trackId: string) => number;
  getModuleProgress: (moduleId: string) => number;
  checkAndUpdateStreak: () => void;
}

const XP_PER_LESSON = 15;
const XP_PER_QUIZ = 25;
const XP_PER_INTERACTIVE = 20;
const XP_PER_MODULE_BONUS = 50;

function getLevel(xp: number): number {
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 300) return 3;
  if (xp < 500) return 4;
  if (xp < 750) return 5;
  if (xp < 1050) return 6;
  if (xp < 1400) return 7;
  if (xp < 1800) return 8;
  if (xp < 2250) return 9;
  return 10;
}

export function getXPForLevel(level: number): number {
  const thresholds = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 3000];
  return thresholds[Math.min(level, 10)] || 3000;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      // Data
      tracks: TRACKS,
      badges: DEFAULT_BADGES,

      // Progress
      completedLessons: [],
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      lessonsToday: 0,
      quizzesCompleted: 0,
      tracksStarted: [],

      // UI
      activeTrackId: null,
      activeModuleId: null,

      // Actions
      completeLesson: (lessonId: string, trackId: string) => {
        const state = get();
        if (state.completedLessons.includes(lessonId)) return;

        // Find lesson type for XP calculation
        let lessonType: string = 'article';
        let moduleCompleted = false;

        for (const track of state.tracks) {
          for (const mod of track.modules) {
            for (const sub of mod.subModules) {
              const lesson = sub.lessons.find(l => l.id === lessonId);
              if (lesson) {
                lessonType = lesson.type;
              }
            }
            // Check if this module is now completed
            const allModuleLessons = mod.subModules.flatMap(s => s.lessons.map(l => l.id));
            const newCompleted = [...state.completedLessons, lessonId];
            if (allModuleLessons.every(lid => newCompleted.includes(lid))) {
              moduleCompleted = true;
            }
          }
        }

        // Calculate XP
        let xpGained = XP_PER_LESSON;
        if (lessonType === 'quiz') xpGained = XP_PER_QUIZ;
        if (lessonType === 'interactive') xpGained = XP_PER_INTERACTIVE;
        if (moduleCompleted) xpGained += XP_PER_MODULE_BONUS;

        const newXP = state.totalXP + xpGained;
        const newLevel = getLevel(newXP);
        const today = getTodayStr();
        const newLessonsToday = state.lastActiveDate === today ? state.lessonsToday + 1 : 1;
        const newQuizzes = lessonType === 'quiz' ? state.quizzesCompleted + 1 : state.quizzesCompleted;
        const newTracksStarted = state.tracksStarted.includes(trackId)
          ? state.tracksStarted
          : [...state.tracksStarted, trackId];

        // Update streak
        let newStreak = state.currentStreak;
        if (state.lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          if (state.lastActiveDate === yesterdayStr) {
            newStreak = state.currentStreak + 1;
          } else if (state.lastActiveDate === null) {
            newStreak = 1;
          } else {
            newStreak = 1; // streak broken
          }
        }
        const newLongest = Math.max(state.longestStreak, newStreak);

        // Badge checks
        const newCompleted = [...state.completedLessons, lessonId];
        const updatedBadges = state.badges.map(badge => {
          if (badge.unlocked) return badge;
          const now = new Date().toISOString();
          switch (badge.id) {
            case 'first-lesson':
              return newCompleted.length >= 1 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'streak-3':
              return newStreak >= 3 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'streak-7':
              return newStreak >= 7 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'streak-30':
              return newStreak >= 30 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'module-complete':
              return moduleCompleted ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'xp-100':
              return newXP >= 100 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'xp-500':
              return newXP >= 500 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'xp-1000':
              return newXP >= 1000 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'speed-learner':
              return newLessonsToday >= 5 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'quiz-ace':
              return newQuizzes >= 5 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            case 'all-tracks':
              return newTracksStarted.length >= 6 ? { ...badge, unlocked: true, unlockedAt: now } : badge;
            default:
              return badge;
          }
        });

        // Check track completion badge
        const trackData = state.tracks.find(t => t.id === trackId);
        if (trackData) {
          const allTrackLessons = trackData.modules.flatMap(m => m.subModules.flatMap(s => s.lessons.map(l => l.id)));
          if (allTrackLessons.every(lid => newCompleted.includes(lid))) {
            const trackBadge = updatedBadges.find(b => b.id === 'track-complete');
            if (trackBadge && !trackBadge.unlocked) {
              trackBadge.unlocked = true;
              trackBadge.unlockedAt = new Date().toISOString();
            }
          }
        }

        set({
          completedLessons: newCompleted,
          totalXP: newXP,
          level: newLevel,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
          lessonsToday: newLessonsToday,
          quizzesCompleted: newQuizzes,
          tracksStarted: newTracksStarted,
          badges: updatedBadges,
        });
      },

      setActiveTrack: (trackId) => set({ activeTrackId: trackId, activeModuleId: null }),
      setActiveModule: (moduleId) => set({ activeModuleId: moduleId }),

      getTrackProgress: (trackId: string) => {
        const state = get();
        const track = state.tracks.find(t => t.id === trackId);
        if (!track) return 0;
        const allLessons = track.modules.flatMap(m => m.subModules.flatMap(s => s.lessons.map(l => l.id)));
        if (allLessons.length === 0) return 0;
        const completed = allLessons.filter(lid => state.completedLessons.includes(lid)).length;
        return Math.round((completed / allLessons.length) * 100);
      },

      getModuleProgress: (moduleId: string) => {
        const state = get();
        for (const track of state.tracks) {
          const mod = track.modules.find(m => m.id === moduleId);
          if (mod) {
            const allLessons = mod.subModules.flatMap(s => s.lessons.map(l => l.id));
            if (allLessons.length === 0) return 0;
            const completed = allLessons.filter(lid => state.completedLessons.includes(lid)).length;
            return Math.round((completed / allLessons.length) * 100);
          }
        }
        return 0;
      },

      checkAndUpdateStreak: () => {
        const state = get();
        const today = getTodayStr();
        if (state.lastActiveDate === today) return; // Already active today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.lastActiveDate !== yesterdayStr && state.lastActiveDate !== null) {
          // Streak broken
          set({ currentStreak: 0 });
        }
      },
    }),
    {
      name: 'tradeshift-learn-progress',
      partialize: (state) => ({
        completedLessons: state.completedLessons,
        totalXP: state.totalXP,
        level: state.level,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        lessonsToday: state.lessonsToday,
        quizzesCompleted: state.quizzesCompleted,
        tracksStarted: state.tracksStarted,
        badges: state.badges,
      }),
    }
  )
);
