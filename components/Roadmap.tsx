import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Trophy,
  Loader2,
  ArrowRight,
  Target,
  BookOpen,
  Briefcase,
  Star,
  Zap,
  Calendar,
  Flag,
  Award,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserProfile, RoadmapPlan, Milestone } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI, Type } from "@google/genai";
import { motion } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function Roadmap({ profile }: { profile: UserProfile }) {
  const [roadmap, setRoadmap] = useState<RoadmapPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatorMode, setGeneratorMode] = useState<'ai' | 'manual'>('ai');
  const [customTitle, setCustomTitle] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);

  useEffect(() => {
    const savedRoadmap = localStorage.getItem('career_hub_roadmap');
    if (savedRoadmap) setRoadmap(JSON.parse(savedRoadmap));
  }, []);

  useEffect(() => {
    if (roadmap) {
      localStorage.setItem('career_hub_roadmap', JSON.stringify(roadmap));
    }
  }, [roadmap]);

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Bạn là một Chuyên gia Tư vấn Sự nghiệp (Career Consultant) cấp cao. Hãy kiến tạo một lộ trình sự nghiệp (Career Roadmap) cực kỳ chi tiết, thực tế và có tính chiến lược cho sinh viên:
        
        THÔNG TIN SINH VIÊN:
        - Chuyên ngành: ${profile.major}
        - Năm học: ${profile.year}
        - Mục tiêu nghề nghiệp: ${customTitle || profile.careerGoal}
        - Sở thích & Thế mạnh: ${profile.interests.join(', ')}
        
        YÊU CẦU LỘ TRÌNH:
        1. Chia thành 5-7 giai đoạn (Milestones) từ hiện tại đến khi đạt được mục tiêu.
        2. Mỗi giai đoạn PHẢI có:
           - title: Tên giai đoạn ấn tượng (VD: "Xây dựng nền tảng vững chắc").
           - timeframe: Khoảng thời gian thực hiện (VD: "3-6 tháng").
           - tasks: 3-5 đầu việc cụ thể, thực tế (VD: "Học khóa học X trên Coursera", "Tham gia CLB Y").
           - skills: 3-5 kỹ năng then chốt cần làm chủ.
           - certificates: Các chứng chỉ uy tín nên đạt được (VD: "IELTS 7.0", "Google Data Analytics").
        3. Lộ trình phải mang tính cá nhân hóa cao, không chung chung.
        
        Ngôn ngữ: Tiếng Việt.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    timeframe: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    certificates: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['id', 'title', 'timeframe', 'tasks', 'skills']
                }
              }
            },
            required: ['title', 'description', 'milestones']
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      const newRoadmap: RoadmapPlan = {
        ...data,
        id: Date.now().toString(),
        completedMilestones: []
      };
      setRoadmap(newRoadmap);
      setCustomTitle('');
    } catch (error) {
      console.error("Error generating roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const createManualRoadmap = () => {
    const newRoadmap: RoadmapPlan = {
      id: Date.now().toString(),
      title: customTitle || 'Lộ trình cá nhân',
      description: 'Lộ trình do bạn tự xây dựng.',
      milestones: [
        {
          id: 'm1',
          title: 'Giai đoạn khởi đầu',
          timeframe: 'Tháng 1-3',
          tasks: ['Tìm hiểu kiến thức cơ bản'],
          skills: ['Kỹ năng tự học']
        }
      ],
      completedMilestones: []
    };
    setRoadmap(newRoadmap);
    setCustomTitle('');
  };

  const toggleMilestone = (milestoneId: string) => {
    if (!roadmap) return;
    const completed = roadmap.completedMilestones.includes(milestoneId);
    const newCompleted = completed 
      ? roadmap.completedMilestones.filter(id => id !== milestoneId)
      : [...roadmap.completedMilestones, milestoneId];
    
    setRoadmap({ ...roadmap, completedMilestones: newCompleted });
  };

  const addMilestone = () => {
    if (!roadmap) return;
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: 'Giai đoạn mới',
      timeframe: 'Thời gian',
      tasks: ['Nhiệm vụ mới'],
      skills: ['Kỹ năng mới'],
      certificates: []
    };
    setRoadmap({
      ...roadmap,
      milestones: [...roadmap.milestones, newMilestone]
    });
    setEditingMilestoneId(newMilestone.id);
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    if (!roadmap) return;
    setRoadmap({
      ...roadmap,
      milestones: roadmap.milestones.map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const deleteMilestone = (id: string) => {
    if (!roadmap) return;
    if (window.confirm('Xóa giai đoạn này?')) {
      setRoadmap({
        ...roadmap,
        milestones: roadmap.milestones.filter(m => m.id !== id)
      });
    }
  };

  const resetRoadmap = () => {
    if (window.confirm('Bạn có chắc muốn xóa lộ trình hiện tại và tạo mới?')) {
      setRoadmap(null);
      localStorage.removeItem('career_hub_roadmap');
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-text">Lộ trình sự nghiệp AI</h2>
          <p className="text-text-muted mt-1">Lộ trình cá nhân hóa dựa trên mục tiêu và chuyên ngành của bạn.</p>
        </div>
        <div className="flex gap-3">
          {roadmap && (
            <button 
              onClick={resetRoadmap}
              className="px-6 py-4 bg-slate-100 text-text-muted rounded-[2rem] font-bold hover:bg-slate-200 transition-all"
            >
              Làm mới
            </button>
          )}
          <button 
            onClick={() => {
              if (roadmap) generateRoadmap();
              else setGeneratorMode('ai');
            }}
            disabled={loading}
            className="px-8 py-4 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            {roadmap ? 'AI Cập nhật lộ trình' : 'Tạo lộ trình mới'}
          </button>
        </div>
      </div>

      {!roadmap && !loading ? (
        <div className="bg-card rounded-[3rem] p-12 border border-border shadow-sm max-w-4xl mx-auto">
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-10 w-fit mx-auto">
            <button 
              onClick={() => setGeneratorMode('ai')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                generatorMode === 'ai' ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text"
              )}
            >
              <Sparkles className="w-4 h-4" /> AI Gợi ý lộ trình
            </button>
            <button 
              onClick={() => setGeneratorMode('manual')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                generatorMode === 'manual' ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text"
              )}
            >
              <Plus className="w-4 h-4" /> Tự xây dựng
            </button>
          </div>

          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto shadow-sm">
              <Map className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-text mb-3 tracking-tight">Xây dựng tương lai của bạn</h3>
              <p className="text-text-muted max-w-md mx-auto text-sm font-medium leading-relaxed">
                {generatorMode === 'ai' 
                  ? `AI sẽ phân tích chuyên ngành ${profile.major} và mục tiêu ${profile.careerGoal} để tạo lộ trình tối ưu.`
                  : "Bạn có thể tự tay thiết kế từng cột mốc quan trọng cho sự nghiệp của mình."}
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <label className="block text-left text-xs font-black text-text-muted uppercase tracking-widest">Mục tiêu nghề nghiệp</label>
              <input 
                type="text" 
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={generatorMode === 'ai' ? `Ví dụ: ${profile.careerGoal}, Senior Dev...` : "Tên lộ trình của bạn..."}
                className="w-full bg-slate-50 px-8 py-5 rounded-[2rem] border border-border focus:ring-1 focus:ring-primary outline-none font-bold text-lg"
              />
            </div>

            <button 
              onClick={generatorMode === 'ai' ? generateRoadmap : createManualRoadmap}
              className="px-12 py-6 bg-primary text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all flex items-center gap-4 mx-auto"
            >
              {generatorMode === 'ai' ? <Sparkles className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
              {generatorMode === 'ai' ? 'AI Tạo lộ trình ngay' : 'Bắt đầu xây dựng'}
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-card rounded-[3rem] p-20 text-center border border-border shadow-sm">
          <div className="w-32 h-32 bg-primary/10 rounded-[3rem] flex items-center justify-center text-primary mx-auto mb-10 animate-bounce">
            <Sparkles className="w-16 h-16" />
          </div>
          <h3 className="text-3xl font-black text-text mb-4 tracking-tight">AI đang kiến tạo lộ trình...</h3>
          <p className="text-text-muted max-w-md mx-auto leading-relaxed font-medium">
            Chúng tôi đang phân tích xu hướng thị trường lao động và yêu cầu kỹ năng cho vị trí <strong>{customTitle || profile.careerGoal}</strong>.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-black text-primary uppercase tracking-widest">Đang xử lý dữ liệu lớn</span>
          </div>
        </div>
      ) : roadmap && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Roadmap Timeline */}
          <div className="lg:col-span-2 space-y-12 relative">
            <div className="absolute left-8 top-10 bottom-10 w-1 bg-slate-100 rounded-full" />
            
            {roadmap.milestones.map((milestone, idx) => {
              const isCompleted = roadmap.completedMilestones.includes(milestone.id);
              const isEditing = editingMilestoneId === milestone.id;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={milestone.id} 
                  className="relative pl-24"
                >
                  <button 
                    onClick={() => toggleMilestone(milestone.id)}
                    className={cn(
                      "absolute left-0 w-16 h-16 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl transition-all z-10",
                      isCompleted ? "bg-success text-white" : "bg-white text-text-muted hover:border-primary/30"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Flag className="w-8 h-8" />}
                  </button>

                  <div className={cn(
                    "bg-card p-10 rounded-[3rem] border border-border shadow-sm transition-all group",
                    isCompleted && "opacity-60 grayscale-[0.5]"
                  )}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-4">
                            <input 
                              type="text" 
                              value={milestone.title}
                              onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                              className="w-full bg-slate-50 px-4 py-2 rounded-xl border border-primary font-black text-xl"
                            />
                            <input 
                              type="text" 
                              value={milestone.timeframe}
                              onChange={(e) => updateMilestone(milestone.id, { timeframe: e.target.value })}
                              className="w-full bg-slate-50 px-4 py-2 rounded-xl border border-border text-xs font-bold"
                            />
                          </div>
                        ) : (
                          <>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full">
                              Giai đoạn {idx + 1}: {milestone.timeframe}
                            </span>
                            <h3 className="text-2xl font-black text-text mt-3 tracking-tight">{milestone.title}</h3>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingMilestoneId(isEditing ? null : milestone.id)}
                          className="p-3 bg-slate-50 rounded-xl text-text-muted hover:text-primary transition-all"
                        >
                          {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => deleteMilestone(milestone.id)}
                          className="p-3 bg-slate-50 rounded-xl text-text-muted hover:text-danger transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          Mục tiêu cần đạt
                        </h4>
                        <ul className="space-y-3">
                          {milestone.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="text-sm text-text font-bold flex items-start gap-4 group/task">
                              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                            <Zap className="w-4 h-4 text-warning" />
                            Kỹ năng trọng tâm
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {milestone.skills.map((skill, sIdx) => (
                              <span key={sIdx} className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-black text-text shadow-sm hover:border-primary transition-all">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        {milestone.certificates && milestone.certificates.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                              <Award className="w-4 h-4 text-success" />
                              Chứng chỉ liên quan
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {milestone.certificates.map((cert, cIdx) => (
                                <span key={cIdx} className="px-4 py-2 bg-success/5 border border-success/20 rounded-xl text-[10px] font-black text-success uppercase tracking-widest">
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <button 
              onClick={addMilestone}
              className="w-full py-8 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-text-muted font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3"
            >
              <Plus className="w-6 h-6" />
              Thêm giai đoạn mới
            </button>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-card rounded-[3rem] p-10 border border-border shadow-sm sticky top-8">
              <h3 className="text-xl font-black text-text mb-8 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-warning" />
                Tiến độ sự nghiệp
              </h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-text-muted uppercase tracking-widest">Hoàn thành</span>
                  <span className="text-3xl font-black text-primary">
                    {Math.round((roadmap.completedMilestones.length / roadmap.milestones.length) * 100)}%
                  </span>
                </div>
                <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden p-1.5 border border-slate-200 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(roadmap.completedMilestones.length / roadmap.milestones.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full shadow-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="text-center p-6 bg-slate-50 rounded-[2rem] border border-border">
                    <p className="text-3xl font-black text-text">{roadmap.milestones.length}</p>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Giai đoạn</p>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-[2rem] border border-border">
                    <p className="text-3xl font-black text-text">{roadmap.completedMilestones.length}</p>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Đã xong</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">Lời khuyên từ AI</h4>
                  <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 relative">
                    <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-primary opacity-20" />
                    <p className="text-sm text-text font-bold leading-relaxed italic">
                      "Dựa trên chuyên ngành {profile.major}, bạn nên ưu tiên hoàn thành các chứng chỉ về {roadmap.milestones[0]?.skills[0]} sớm để tạo lợi thế cạnh tranh."
                    </p>
                  </div>
                </div>

                <button className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 group">
                  Xuất lộ trình (PDF)
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
