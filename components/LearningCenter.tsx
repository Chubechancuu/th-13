import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Search,
  Filter,
  Star,
  Clock,
  Zap,
  Library,
  GraduationCap,
  Trophy,
  Lightbulb,
  Sword,
  Shield,
  Target,
  Award,
  MessageSquare,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { UserProfile, SubjectContent, Challenge } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function LearningCenter({ profile, onUpdateProfile }: { 
  profile: UserProfile,
  onUpdateProfile: (p: UserProfile) => void
}) {
  const [subjects, setSubjects] = useState<SubjectContent[]>([]);
  const [activeSubject, setActiveSubject] = useState<SubjectContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'learning' | 'arena'>('learning');

  const [customSubject, setCustomSubject] = useState('');

  useEffect(() => {
    const savedSubjects = localStorage.getItem('career_hub_subjects');
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
  }, []);

  const generateSubject = async (subjectName: string) => {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Hãy soạn giáo trình cực kỳ chi tiết và chuyên sâu cho môn học "${subjectName}" dành cho sinh viên năm ${profile.year} chuyên ngành ${profile.major}.
        
        YÊU CẦU QUAN TRỌNG:
        1. Nội dung bài giảng (content) phải cực kỳ chi tiết, giải thích cặn kẽ các khái niệm.
        2. Mỗi bài giảng PHẢI có ít nhất 2 ví dụ thực tế (real-world examples) cụ thể, dễ hiểu, gắn liền với đời sống hoặc công việc chuyên môn.
        3. Các khái niệm then chốt (keyConcepts) phải được định nghĩa rõ ràng.
        4. Tóm tắt (summary) súc tích nhưng đầy đủ ý chính.
        5. Bài tập ôn tập (exercises) để người dùng tự luyện tập (không cần đáp án ngay).
        6. Thử thách (challenges) phải đa dạng:
           - 3 mức độ: Dễ (Easy), Trung bình (Medium), Khó (Hard).
           - 3 thể loại: Trắc nghiệm (multiple-choice), Tự luận (essay - AI sẽ chấm dựa trên ý chính), Điền khuyết (fill-in-the-blank).
        7. Câu hỏi và ví dụ không được trùng lặp, phải mang tính thực tiễn cao.
        
        Ngôn ngữ: Tiếng Việt.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              lessons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    summary: { type: Type.STRING },
                    examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                    exercises: { type: Type.ARRAY, items: { type: Type.STRING } },
                    challenges: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          level: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
                          type: { type: Type.STRING, enum: ['multiple-choice', 'essay', 'fill-in-the-blank'] },
                          question: { type: Type.STRING },
                          options: { type: Type.ARRAY, items: { type: Type.STRING } },
                          answer: { type: Type.STRING },
                          explanation: { type: Type.STRING }
                        },
                        required: ['level', 'type', 'question', 'answer', 'explanation']
                      }
                    }
                  },
                  required: ['id', 'title', 'content', 'keyConcepts', 'summary', 'examples', 'exercises', 'challenges']
                }
              }
            },
            required: ['title', 'description', 'lessons']
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      const newSubject: SubjectContent = { 
        ...data, 
        id: Date.now().toString(),
        stats: {
          completedLessons: 0,
          xpGained: 0,
          badges: []
        }
      };
      const updatedSubjects = [newSubject, ...subjects];
      setSubjects(updatedSubjects);
      localStorage.setItem('career_hub_subjects', JSON.stringify(updatedSubjects));
      setActiveSubject(newSubject);
    } catch (error) {
      console.error("Error generating subject:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'year1', label: 'Năm 1: Nền tảng', subjects: ["Kinh tế vi mô", "Nguyên lý kế toán", "Toán cao cấp", "Tin học đại cương", "Tiếng Anh 1"] },
    { id: 'year2', label: 'Năm 2: Chuyên sâu', subjects: ["Kinh tế vĩ mô", "Marketing căn bản", "Quản trị học", "Tài chính doanh nghiệp", "Thống kê kinh doanh"] }
  ];

  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeLevel, setChallengeLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [challengeType, setChallengeType] = useState<'multiple-choice' | 'essay' | 'fill-in-the-blank'>('multiple-choice');
  const [feedback, setFeedback] = useState<{ correct: boolean, explanation: string } | null>(null);

  const currentLesson = activeSubject?.lessons[activeLessonIdx];
  const filteredChallenges = activeSubject?.challenges.filter(c => c.level === challengeLevel && c.type === challengeType) || [];

  const handleCheckAnswer = (challenge: any, userAnswer: string) => {
    const isCorrect = userAnswer.toLowerCase().trim() === challenge.answer.toLowerCase().trim();
    setFeedback({
      correct: isCorrect,
      explanation: challenge.explanation
    });

    if (isCorrect) {
      onUpdateProfile({
        ...profile,
        xp: profile.xp + (challengeLevel === 'easy' ? 10 : challengeLevel === 'medium' ? 20 : 50)
      });
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-text">Trung tâm học thuật & Đấu trường</h2>
          <p className="text-text-muted mt-1">Nâng cấp kiến thức và chinh phục các thử thách đỉnh cao.</p>
        </div>
        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('learning')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'learning' ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text"
            )}
          >
            <Library className="w-4 h-4" /> Học tập
          </button>
          <button 
            onClick={() => setActiveTab('arena')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'arena' ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text"
            )}
          >
            <Sword className="w-4 h-4" /> Đấu trường 100
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'learning' ? (
          <motion.div 
            key="learning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {!activeSubject ? (
              <div className="space-y-12">
                {/* Custom Subject Input */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-black text-text uppercase tracking-widest ml-2">Bạn muốn học môn gì hôm nay?</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input 
                          type="text"
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          placeholder="Nhập tên môn học (VD: Kế toán tài chính, Marketing...)"
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (customSubject.trim()) {
                          generateSubject(customSubject);
                          setCustomSubject('');
                        }
                      }}
                      disabled={loading || !customSubject.trim()}
                      className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      Tạo giáo trình AI
                    </button>
                  </div>
                </section>

                {categories.map((cat) => (
                  <section key={cat.id} className="space-y-6">
                    <h3 className="text-xl font-black text-text flex items-center gap-3">
                      <GraduationCap className={cn("w-6 h-6", cat.id === 'year1' ? "text-blue-500" : "text-purple-500")} />
                      {cat.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cat.subjects.map((sub, idx) => (
                        <button 
                          key={idx}
                          onClick={() => generateSubject(sub)}
                          disabled={loading}
                          className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm hover:border-primary hover:shadow-xl transition-all text-left group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BookOpen className="w-24 h-24" />
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-text-muted mb-6 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <BookOpen className="w-7 h-7" />
                          </div>
                          <h4 className="text-lg font-bold text-text mb-2">{sub}</h4>
                          <p className="text-xs text-text-muted mb-6 leading-relaxed">AI soạn thảo giáo trình chi tiết dựa trên chương trình đại học.</p>
                          <div className="flex items-center gap-2 text-primary font-bold text-sm">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bắt đầu học'}
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}

                {subjects.length > 0 && (
                  <section className="space-y-6">
                    <h3 className="text-xl font-black text-text flex items-center gap-3">
                      <Library className="w-6 h-6 text-success" />
                      Môn học của tôi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {subjects.map((sub) => (
                        <button 
                          key={sub.id}
                          onClick={() => setActiveSubject(sub)}
                          className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-left group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-text-muted mb-4 group-hover:bg-success/10 group-hover:text-success transition-all">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-text truncate">{sub.title}</h4>
                          <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-bold">{sub.lessons.length} bài học</p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Lesson Sidebar */}
                <div className="space-y-6">
                  <button 
                    onClick={() => setActiveSubject(null)}
                    className="flex items-center gap-2 text-text-muted hover:text-text font-bold transition-colors mb-4"
                  >
                    <ArrowLeft className="w-5 h-5" /> Quay lại
                  </button>

                  <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm">
                    <h3 className="text-lg font-black text-text mb-8">{activeSubject.title}</h3>
                    <div className="space-y-3">
                      {activeSubject.lessons.map((lesson, idx) => (
                        <button 
                          key={lesson.id}
                          onClick={() => {
                            setActiveLessonIdx(idx);
                            setShowChallenge(false);
                            setFeedback(null);
                          }}
                          className={cn(
                            "w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 group",
                            activeLessonIdx === idx 
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                              : "bg-slate-50 border-transparent hover:border-primary/30"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                            activeLessonIdx === idx ? "bg-white/20 text-white" : "bg-white border border-border text-text-muted"
                          )}>
                            {idx + 1}
                          </div>
                          <span className="text-xs font-bold truncate">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="bg-card rounded-[3rem] p-10 lg:p-12 border border-border shadow-sm min-h-[600px]">
                    <AnimatePresence mode="wait">
                      {!showChallenge ? (
                        <motion.div 
                          key="lesson"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="max-w-3xl mx-auto space-y-12"
                        >
                          <div className="space-y-4">
                            <span className="text-xs font-black text-primary uppercase tracking-widest">Bài học {activeLessonIdx + 1}</span>
                            <h2 className="text-4xl font-black text-text tracking-tight">{currentLesson?.title}</h2>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                              <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Khái niệm then chốt</h4>
                              <ul className="space-y-2">
                                {currentLesson?.keyConcepts.map((c, i) => (
                                  <li key={i} className="text-sm text-blue-900 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                              <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-4">Tóm tắt nhanh</h4>
                              <p className="text-sm text-purple-900 leading-relaxed">{currentLesson?.summary}</p>
                            </div>
                          </div>
                          
                          <div className="prose prose-slate max-w-none">
                            <div className="text-lg text-text-muted leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                              <Markdown>{currentLesson?.content || ""}</Markdown>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <h3 className="text-xl font-black text-text flex items-center gap-2">
                                <Lightbulb className="w-6 h-6 text-warning" />
                                Ví dụ thực tế
                              </h3>
                              <div className="space-y-4">
                                {currentLesson?.examples.map((ex, i) => (
                                  <div key={i} className="p-6 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                                    <p className="text-sm text-text leading-relaxed">
                                      <span className="font-black text-primary mr-2">VD {i + 1}:</span>
                                      {ex}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-6">
                              <h3 className="text-xl font-black text-text flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-success" />
                                Bài tập tự luyện
                              </h3>
                              <div className="space-y-4">
                                {(currentLesson as any)?.exercises?.map((ex: string, i: number) => (
                                  <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                    <p className="text-sm text-text-muted font-medium">
                                      {i + 1}. {ex}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-10 border-t border-border flex justify-center">
                            <button 
                              onClick={() => setShowChallenge(true)}
                              className="px-10 py-5 bg-primary text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3"
                            >
                              <Zap className="w-6 h-6" />
                              Thử thách ôn tập
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="challenge"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="max-w-3xl mx-auto space-y-10"
                        >
                          <div className="flex items-center justify-between">
                            <button 
                              onClick={() => setShowChallenge(false)}
                              className="flex items-center gap-2 text-text-muted hover:text-text font-bold transition-colors"
                            >
                              <ArrowLeft className="w-5 h-5" /> Quay lại bài học
                            </button>
                            <div className="flex gap-2">
                              {(['easy', 'medium', 'hard'] as const).map(lvl => (
                                <button 
                                  key={lvl}
                                  onClick={() => setChallengeLevel(lvl)}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    challengeLevel === lvl ? "bg-primary text-white border-primary" : "bg-white text-text-muted border-border"
                                  )}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 justify-center">
                            {(['multiple-choice', 'essay', 'fill-in-the-blank'] as const).map(type => (
                              <button 
                                key={type}
                                onClick={() => setChallengeType(type)}
                                className={cn(
                                  "px-6 py-3 rounded-2xl text-xs font-bold transition-all border",
                                  challengeType === type ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-muted border-border"
                                )}
                              >
                                {type === 'multiple-choice' ? 'Trắc nghiệm' : type === 'essay' ? 'Tự luận' : 'Điền khuyết'}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-8">
                            {filteredChallenges.map((challenge, idx) => (
                              <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-border space-y-6">
                                <h4 className="text-lg font-bold text-text">{challenge.question}</h4>
                                
                                {challenge.type === 'multiple-choice' && challenge.options && (
                                  <div className="grid grid-cols-1 gap-3">
                                    {challenge.options.map((opt, i) => (
                                      <button 
                                        key={i} 
                                        onClick={() => handleCheckAnswer(challenge, opt)}
                                        className="p-4 bg-white rounded-xl border border-border hover:border-primary text-left text-sm font-medium transition-all"
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {challenge.type !== 'multiple-choice' && (
                                  <div className="space-y-4">
                                    <textarea 
                                      className="w-full p-6 bg-white rounded-2xl border border-border focus:ring-1 focus:ring-primary outline-none h-32 resize-none text-sm"
                                      placeholder="Nhập câu trả lời của bạn..."
                                      id={`answer-${idx}`}
                                    />
                                    <button 
                                      onClick={() => {
                                        const el = document.getElementById(`answer-${idx}`) as HTMLTextAreaElement;
                                        handleCheckAnswer(challenge, el.value);
                                      }}
                                      className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm"
                                    >
                                      Kiểm tra
                                    </button>
                                  </div>
                                )}

                                {feedback && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={cn(
                                      "p-6 rounded-2xl border",
                                      feedback.correct ? "bg-success/10 border-success/30 text-success" : "bg-danger/10 border-danger/30 text-danger"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 font-bold mb-2">
                                      {feedback.correct ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                      {feedback.correct ? 'Chính xác!' : 'Chưa đúng rồi!'}
                                    </div>
                                    <p className="text-sm opacity-80">{feedback.explanation}</p>
                                  </motion.div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="arena"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card rounded-[3rem] p-12 border border-border shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col items-center justify-center text-center"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Sword className="w-64 h-64" />
            </div>
            
            <div className="max-w-2xl space-y-8 relative z-10">
              <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8">
                <Trophy className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-black text-text tracking-tight">Đấu trường 100 Câu hỏi</h2>
              <p className="text-text-muted text-lg leading-relaxed">
                Thử thách bản thân với 100 câu hỏi tổng hợp từ tất cả các môn học bạn đã học. 
                Vượt qua các mốc quan trọng để nhận huy hiệu và XP cực khủng!
              </p>
              
              <div className="grid grid-cols-3 gap-6 py-10">
                <div className="p-6 bg-slate-50 rounded-3xl border border-border">
                  <p className="text-2xl font-black text-text">0/100</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Tiến độ</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-border">
                  <p className="text-2xl font-black text-text">0</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Kỷ lục</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-border">
                  <p className="text-2xl font-black text-text">Lv. 1</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Hạng</p>
                </div>
              </div>

              <button className="px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-4 mx-auto">
                <Play className="w-8 h-8 fill-current" />
                Bắt đầu Đấu trường
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
