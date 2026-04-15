import React, { useState, useEffect, useRef } from 'react';
import { 
  Sword, 
  Briefcase, 
  Mic, 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  ChevronRight, 
  Trophy, 
  Target, 
  Zap,
  Building2,
  Users,
  MessageSquare,
  BarChart3,
  Award,
  AlertCircle,
  ShieldAlert,
  Languages,
  Cpu,
  UserCheck,
  Star,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { UserProfile, ArenaSession } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

type ArenaMode = 'internship' | 'interview';
type InterviewType = 'hr' | 'technical' | 'english' | 'stress';

export default function InternshipArena({ profile }: { profile: UserProfile }) {
  const [session, setSession] = useState<ArenaSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ArenaMode>('internship');
  const [interviewType, setInterviewType] = useState<InterviewType>('hr');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'stress'>('medium');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const startSession = async () => {
    if (!role || !industry) return;
    setLoading(true);
    try {
      const prompt = mode === 'internship' 
        ? `Bạn là một Quản lý trực tiếp (Line Manager) dày dạn kinh nghiệm tại một tập đoàn đa quốc gia trong lĩnh vực ${industry}. 
           Hãy bắt đầu một buổi thực tập ảo (Virtual Internship) cho sinh viên năm ${profile.year} vị trí ${role}. 
           
           YÊU CẦU:
           1. Đưa ra một nhiệm vụ thực tế, cụ thể và có tính thách thức (VD: "Phân tích dữ liệu doanh thu tháng trước và đề xuất giải pháp", "Soạn thảo email phản hồi khiếu nại khách hàng khó tính").
           2. Độ khó: ${difficulty}.
           3. Ngôn ngữ chuyên nghiệp, đúng chất môi trường công sở.
           4. Hãy bắt đầu bằng cách chào hỏi và giao nhiệm vụ đầu tiên.`
        : `Bạn là một Chuyên gia Tuyển dụng (Senior Recruiter) tại một công ty hàng đầu. 
           Hãy bắt đầu buổi phỏng vấn mô phỏng (Mock Interview) loại ${interviewType} cho vị trí ${role} trong ngành ${industry}.
           
           YÊU CẦU:
           1. Đưa ra câu hỏi phỏng vấn sát với thực tế tuyển dụng.
           2. Độ khó: ${difficulty}.
           3. Đóng vai một người phỏng vấn nghiêm túc nhưng công bằng.
           4. Bắt đầu bằng lời chào và câu hỏi phá băng hoặc câu hỏi chuyên môn đầu tiên.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      const initialMessage = response.text || "Chào mừng bạn đến với Đấu trường. Chúng ta bắt đầu nhé?";
      
      const newSession: ArenaSession = {
        id: Date.now().toString(),
        type: mode,
        role,
        industry,
        difficulty,
        messages: [{ role: 'ai', content: initialMessage }],
        status: 'active'
      };

      setSession(newSession);
    } catch (error) {
      console.error("Error starting arena session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !session) return;

    const userMsg = { role: 'user' as const, content: input };
    const updatedMessages = [...session.messages, userMsg];
    setSession({ ...session, messages: updatedMessages });
    setInput('');
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Tiếp tục buổi ${session.type === 'internship' ? 'thực tập' : 'phỏng vấn'} cho vị trí ${session.role}.
        Lịch sử trò chuyện: ${JSON.stringify(updatedMessages)}
        Hãy phản hồi lại người dùng một cách thực tế. 
        Nếu bạn cảm thấy buổi học nên kết thúc (sau khoảng 5-7 lượt trao đổi), hãy đưa ra ĐÁNH GIÁ CHI TIẾT bao gồm:
        1. Điểm mạnh
        2. Điểm cần cải thiện
        3. Điểm tự tin (Confidence Score: 0-100)
        4. Mẹo giao tiếp (Communication Tips)
        Sử dụng định dạng Markdown.`,
      });

      const aiMsg = { role: 'ai' as const, content: response.text || "..." };
      setSession({ ...session, messages: [...updatedMessages, aiMsg] });
    } catch (error) {
      console.error("Error in arena chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const interviewTypes = [
    { id: 'hr', label: 'Phỏng vấn HR', icon: UserCheck, color: 'text-blue-500' },
    { id: 'technical', label: 'Kỹ thuật', icon: Cpu, color: 'text-purple-500' },
    { id: 'english', label: 'Tiếng Anh', icon: Languages, color: 'text-success' },
    { id: 'stress', label: 'Áp lực', icon: ShieldAlert, color: 'text-danger' }
  ];

  if (!session) {
    return (
      <div className="space-y-10 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-text">Đấu trường Thực tế</h2>
            <p className="text-text-muted mt-1">Nơi biến kiến thức thành kỹ năng thực chiến.</p>
          </div>
          <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
            <button 
              onClick={() => setMode('internship')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-widest",
                mode === 'internship' ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text"
              )}
            >
              <Briefcase className="w-4 h-4" /> Thực tập ảo
            </button>
            <button 
              onClick={() => setMode('interview')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-widest",
                mode === 'interview' ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text"
              )}
            >
              <Mic className="w-4 h-4" /> Phỏng vấn AI
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-card rounded-[3rem] p-12 border border-border shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <Sword className="w-48 h-48" />
              </div>
              
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary shadow-inner">
                    {mode === 'internship' ? <Briefcase className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-text tracking-tight">
                      {mode === 'internship' ? 'Mô phỏng Thực tập' : 'Luyện tập Phỏng vấn'}
                    </h3>
                    <p className="text-text-muted font-medium">Thiết lập kịch bản thực tế để bắt đầu rèn luyện.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Vị trí & Ngành</label>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Vị trí (VD: Marketing Intern)"
                        className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-1 focus:ring-primary outline-none font-bold"
                      />
                      <input 
                        type="text" 
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Ngành (VD: FMCG, Tech, Finance)"
                        className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-1 focus:ring-primary outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Độ khó & Chế độ</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['easy', 'medium', 'hard', 'stress'].map(d => (
                        <button 
                          key={d}
                          onClick={() => setDifficulty(d as any)}
                          className={cn(
                            "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            difficulty === d ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-text-muted border-border hover:border-primary"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {mode === 'interview' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Loại hình phỏng vấn</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {interviewTypes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setInterviewType(t.id as InterviewType)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3",
                            interviewType === t.id ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white border-border hover:border-primary"
                          )}
                        >
                          <t.icon className={cn("w-6 h-6", interviewType === t.id ? "text-white" : t.color)} />
                          <span className="text-[10px] font-black uppercase tracking-tighter">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={startSession}
                  disabled={loading || !role || !industry}
                  className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Zap className="w-7 h-7" />}
                  Bắt đầu thử thách ngay
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-border shadow-sm space-y-6 group hover:border-primary transition-all">
                <div className="w-16 h-16 bg-purple-100 rounded-[1.5rem] flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-xl text-text mb-2">Cộng đồng & Mentor</h4>
                  <p className="text-sm text-text-muted leading-relaxed font-medium">Kết nối với các chuyên gia trong ngành và nhận phản hồi từ cộng đồng sinh viên ưu tú.</p>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-border shadow-sm space-y-6 group hover:border-primary transition-all">
                <div className="w-16 h-16 bg-orange-100 rounded-[1.5rem] flex items-center justify-center text-orange-600 shadow-inner group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-xl text-text mb-2">Chứng nhận thực chiến</h4>
                  <p className="text-sm text-text-muted leading-relaxed font-medium">Nhận chứng nhận kỹ năng từ AI sau khi hoàn thành xuất sắc các nhiệm vụ mô phỏng.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="bg-card rounded-[3rem] p-10 border border-border shadow-sm">
              <h3 className="text-xl font-black text-text mb-8 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-warning" />
                Kỹ năng của bạn
              </h3>
              <div className="space-y-8">
                {[
                  { label: 'Giao tiếp', level: 4, progress: 85, color: 'bg-blue-500', icon: MessageSquare },
                  { label: 'Giải quyết vấn đề', level: 3, progress: 72, color: 'bg-purple-500', icon: BarChart3 },
                  { label: 'Tư duy phản biện', level: 5, progress: 90, color: 'bg-success', icon: Zap }
                ].map((skill, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <skill.icon className="w-4 h-4 text-text-muted" />
                        <span className="text-xs font-black text-text uppercase tracking-widest">{skill.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Lvl {skill.level}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.progress}%` }}
                        className={cn("h-full", skill.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <AlertCircle className="w-24 h-24" />
              </div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-warning" />
                Mẹo từ AI Mentor
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed italic font-medium">
                "Trong phỏng vấn kỹ thuật, đừng chỉ đưa ra câu trả lời đúng. Hãy giải thích tư duy và cách bạn tiếp cận vấn đề. Đó là điều nhà tuyển dụng thực sự tìm kiếm."
              </p>
              <button className="mt-8 text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                Xem thêm mẹo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="p-8 border-b border-border bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/20">
            {session.type === 'internship' ? <Briefcase className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-2xl font-black text-text tracking-tight">{session.role}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">{session.industry}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[10px] text-primary font-black uppercase tracking-widest">{session.difficulty}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setSession(null)}
          className="px-8 py-3 bg-white border border-border rounded-2xl text-xs font-black text-text-muted hover:text-danger hover:border-danger transition-all uppercase tracking-widest"
        >
          Kết thúc phiên
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide bg-slate-50/30">
        {session.messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={cn(
              "flex gap-6 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
              msg.role === 'user' ? "bg-primary text-white" : "bg-white border border-border text-primary"
            )}>
              {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </div>
            <div className={cn(
              "p-8 rounded-[2.5rem] text-sm leading-relaxed shadow-sm",
              msg.role === 'user' ? "bg-primary text-white" : "bg-white border border-border text-text"
            )}>
              <div className="prose prose-sm max-w-none prose-slate">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-6 max-w-[85%]">
            <div className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center animate-pulse">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div className="bg-white border border-border p-8 rounded-[2.5rem]">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-8 border-t border-border bg-white">
        <div className="relative flex items-center gap-6">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập phản hồi của bạn tại đây..."
            className="flex-1 bg-slate-50 px-8 py-5 rounded-[2rem] border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            <Send className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}
