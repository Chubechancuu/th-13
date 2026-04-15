import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  MessageSquare,
  Trash2,
  ChevronRight,
  Zap,
  Star,
  Clock,
  Mic,
  Image as ImageIcon,
  Paperclip,
  Volume2,
  ListChecks,
  FileText
} from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

type TutorMode = 'quick' | 'deep' | 'practice' | 'summary';

export default function AITutor({ profile }: { profile: UserProfile }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<TutorMode>('quick');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('career_hub_chat');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  useEffect(() => {
    localStorage.setItem('career_hub_chat', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const modePrompts = {
      quick: "Trả lời ngắn gọn, súc tích, đi thẳng vào vấn đề.",
      deep: "Giải thích chuyên sâu, chi tiết, có ví dụ thực tế và phân tích đa chiều.",
      practice: "Đưa ra các câu hỏi thực hành hoặc bài tập liên quan đến chủ đề để sinh viên tự luyện tập.",
      summary: "Tóm tắt lại các ý chính một cách hệ thống, dễ nhớ."
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Bạn là một Gia sư AI (AI Tutor) thông minh, tận tâm và có kiến thức sâu rộng, chuyên hỗ trợ sinh viên năm ${profile.year} chuyên ngành ${profile.major}. 
        
        PHONG CÁCH TRẢ LỜI:
        - Chế độ hiện tại: ${modePrompts[mode]}
        - Luôn trả lời một cách chuyên nghiệp, dễ hiểu, truyền cảm hứng.
        - PHẢI có ít nhất một ví dụ thực tế (real-world example) minh họa cho câu trả lời.
        - Sử dụng định dạng Markdown (tiêu đề, danh sách, in đậm) để thông tin rõ ràng, dễ đọc.
        - Nếu câu hỏi không rõ ràng, hãy đặt câu hỏi gợi mở để hiểu rõ hơn nhu cầu của sinh viên.
        
        BỐI CẢNH SINH VIÊN:
        - Chuyên ngành: ${profile.major}
        - Năm học: ${profile.year}
        - Mục tiêu: Phát triển sự nghiệp và đạt kết quả học tập tốt.
        
        Câu hỏi của sinh viên: "${input}"`,
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.text || "Tôi xin lỗi, tôi gặp chút trục trặc khi xử lý câu hỏi này.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in AI Tutor chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?')) {
      setMessages([]);
      localStorage.removeItem('career_hub_chat');
    }
  };

  const modes = [
    { id: 'quick', label: 'Trả lời nhanh', icon: Zap, color: 'text-yellow-500' },
    { id: 'deep', label: 'Giải thích sâu', icon: Brain, color: 'text-purple-500' },
    { id: 'practice', label: 'Luyện tập', icon: ListChecks, color: 'text-success' },
    { id: 'summary', label: 'Tóm tắt', icon: FileText, color: 'text-blue-500' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 h-[calc(100vh-12rem)]">
      {/* Sidebar: Modes & History */}
      <div className="hidden lg:flex flex-col gap-8">
        <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm space-y-6">
          <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">Chế độ gia sư</h3>
          <div className="space-y-2">
            {modes.map((m) => (
              <button 
                key={m.id}
                onClick={() => setMode(m.id as TutorMode)}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 group",
                  mode === m.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 border-transparent hover:border-border"
                )}
              >
                <m.icon className={cn("w-5 h-5", mode === m.id ? "text-white" : m.color)} />
                <span className="text-xs font-bold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Lịch sử
            </h3>
            <button onClick={clearChat} className="text-text-muted hover:text-danger transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
            {messages.filter(m => m.role === 'user').slice(-5).map((m, idx) => (
              <button 
                key={idx}
                onClick={() => setInput(m.content)}
                className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-border transition-all text-left group"
              >
                <p className="text-xs font-bold text-text truncate">{m.content}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3 flex flex-col bg-card rounded-[3rem] border border-border shadow-xl overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-8 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-text tracking-tight">Gia sư AI Thông minh</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <p className="text-[10px] text-success font-black uppercase tracking-widest">Đang sẵn sàng hỗ trợ</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 bg-white rounded-xl border border-border text-text-muted hover:text-primary transition-all">
              <Volume2 className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white rounded-xl border border-border text-text-muted hover:text-primary transition-all">
              <Star className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide bg-slate-50/30">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
              <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary">
                <Sparkles className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text mb-4">Chào {profile.name}!</h3>
                <p className="text-text-muted leading-relaxed">
                  Tôi là gia sư AI của bạn. Bạn có câu hỏi nào về chuyên ngành <strong>{profile.major}</strong> hay cần hỗ trợ gì cho bài tập hôm nay không?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button onClick={() => setInput("Giải thích khái niệm Kinh tế vi mô")} className="p-4 bg-white rounded-2xl border border-border text-xs font-bold text-text flex items-center gap-3 hover:border-primary transition-all">
                  <Brain className="w-5 h-5 text-purple-500" /> Giải đáp kiến thức
                </button>
                <button onClick={() => setInput("Gợi ý lộ trình học SQL")} className="p-4 bg-white rounded-2xl border border-border text-xs font-bold text-text flex items-center gap-3 hover:border-primary transition-all">
                  <Lightbulb className="w-5 h-5 text-warning" /> Gợi ý ý tưởng
                </button>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
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
                "p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm",
                msg.role === 'user' ? "bg-primary text-white" : "bg-white border border-border text-text"
              )}>
                {msg.role === 'ai' ? (
                  <div className="prose prose-sm max-w-none prose-slate">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  msg.content
                )}
                <div className={cn(
                  "text-[10px] mt-4 font-bold uppercase tracking-widest opacity-50",
                  msg.role === 'user' ? "text-right" : "text-left"
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-6 max-w-[85%]">
              <div className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center animate-pulse">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div className="bg-white border border-border p-6 rounded-[2rem]">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-border bg-white">
          <div className="relative flex items-center gap-4">
            <div className="flex gap-2">
              <button className="p-4 bg-slate-50 text-text-muted rounded-2xl hover:bg-slate-100 transition-all">
                <Paperclip className="w-6 h-6" />
              </button>
              <button className="p-4 bg-slate-50 text-text-muted rounded-2xl hover:bg-slate-100 transition-all">
                <ImageIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi của bạn tại đây..."
                className="w-full bg-slate-50 px-8 py-5 rounded-[2rem] border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pr-20 text-sm font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button className="p-2 text-text-muted hover:text-primary transition-all">
                  <Mic className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
