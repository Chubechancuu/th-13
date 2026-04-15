import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Target, 
  BookOpen, 
  ChevronRight,
  Loader2,
  Trash2,
  AlertCircle,
  X,
  GripVertical,
  Check,
  Edit2,
  Save,
  Zap,
  ArrowRight
} from 'lucide-react';
import { UserProfile, StudyPlan, DailyTask } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function StudyPlanner({ profile }: { profile: UserProfile }) {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<{planId: string, taskId: string} | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    examDate: '',
    difficulty: 'medium',
    availableTime: '2',
    gpaTarget: '4.0',
    weakTopics: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('career_hub_plans');
    if (saved) setPlans(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('career_hub_plans', JSON.stringify(plans));
  }, [plans]);

  const [generatorMode, setGeneratorMode] = useState<'ai' | 'manual'>('ai');

  const generatePlan = async () => {
    if (!formData.subject) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Bạn là một chuyên gia tối ưu hóa học tập (Learning Optimization Expert). Hãy tạo một kế hoạch học tập cực kỳ chi tiết và khoa học cho môn học "${formData.subject}".
        
        THÔNG TIN NGƯỜI HỌC:
        - Chuyên ngành: ${profile.major}
        - Năm học: ${profile.year}
        - Mục tiêu GPA: ${formData.gpaTarget}/4.0
        - Độ khó mong muốn: ${formData.difficulty}
        - Thời gian rảnh mỗi ngày: ${formData.availableTime} giờ
        - Ngày thi dự kiến: ${formData.examDate}
        - Phần kiến thức còn yếu: ${formData.weakTopics}
        
        YÊU CẦU KẾ HOẠCH:
        1. Chia nhỏ môn học thành các nhiệm vụ cụ thể, có thể hoàn thành trong 30-60 phút.
        2. dailyTasks: Danh sách nhiệm vụ cho 1 ngày điển hình. Mỗi nhiệm vụ PHẢI có:
           - text: Tên nhiệm vụ rõ ràng (VD: "Ôn tập chương 1: Cung cầu").
           - priority: 'high' (quan trọng/khó), 'medium', 'low'.
           - startTime: Giờ bắt đầu (định dạng HH:mm, VD: "08:00").
           - endTime: Giờ kết thúc (định dạng HH:mm, VD: "09:00").
        3. weeklyGoals: 3-5 mục tiêu lớn cần đạt được trong tuần này.
        4. isExamRush: Nếu ngày thi cách hiện tại ít hơn 7 ngày, hãy đặt là true và tăng cường độ học tập (nhiệm vụ dày hơn, tập trung ôn luyện đề).
        
        Ngôn ngữ: Tiếng Việt.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dailyTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                    startTime: { type: Type.STRING },
                    endTime: { type: Type.STRING }
                  },
                  required: ['text', 'priority']
                }
              },
              weeklyGoals: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              isExamRush: { type: Type.BOOLEAN }
            },
            required: ['dailyTasks', 'weeklyGoals', 'isExamRush']
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      
      const newPlan: StudyPlan = {
        id: Date.now().toString(),
        subject: formData.subject,
        dailyTasks: data.dailyTasks.map((t: any) => ({
          ...t,
          id: Math.random().toString(36).substr(2, 9),
          completed: false
        })),
        weeklyGoals: data.weeklyGoals,
        examDate: formData.examDate,
        progress: 0,
        gpaTarget: parseFloat(formData.gpaTarget),
        isExamRush: data.isExamRush
      };
      
      setPlans([newPlan, ...plans]);
      setShowGenerator(false);
      setFormData({ subject: '', examDate: '', difficulty: 'medium', availableTime: '2', gpaTarget: '4.0', weakTopics: '' });
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const createManualPlan = () => {
    if (!formData.subject) return;
    const newPlan: StudyPlan = {
      id: Date.now().toString(),
      subject: formData.subject,
      dailyTasks: [],
      weeklyGoals: [],
      examDate: formData.examDate,
      progress: 0,
      gpaTarget: parseFloat(formData.gpaTarget),
      isExamRush: false
    };
    setPlans([newPlan, ...plans]);
    setShowGenerator(false);
    setFormData({ subject: '', examDate: '', difficulty: 'medium', availableTime: '2', gpaTarget: '4.0', weakTopics: '' });
  };

  const deletePlan = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa kế hoạch này?')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const toggleTask = (planId: string, taskId: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        const newTasks = p.dailyTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        const completedCount = newTasks.filter(t => t.completed).length;
        const progress = newTasks.length > 0 ? Math.round((completedCount / newTasks.length) * 100) : 0;
        return { ...p, dailyTasks: newTasks, progress };
      }
      return p;
    }));
  };

  const addTaskManually = (planId: string) => {
    const newTask: DailyTask = {
      id: Math.random().toString(36).substr(2, 9),
      text: 'Nhiệm vụ mới',
      completed: false,
      priority: 'medium',
      startTime: '08:00',
      endTime: '09:00'
    };
    setPlans(plans.map(p => {
      if (p.id === planId) {
        const newTasks = [...p.dailyTasks, newTask];
        const completedCount = newTasks.filter(t => t.completed).length;
        const progress = Math.round((completedCount / newTasks.length) * 100);
        return { ...p, dailyTasks: newTasks, progress };
      }
      return p;
    }));
    setEditingTaskId({ planId, taskId: newTask.id });
  };

  const updateTaskText = (planId: string, taskId: string, text: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          dailyTasks: p.dailyTasks.map(t => t.id === taskId ? { ...t, text } : t)
        };
      }
      return p;
    }));
  };

  const autoRearrange = (planId: string) => {
    // Logic simulation for auto-rearranging missed tasks
    setPlans(plans.map(p => {
      if (p.id === planId) {
        const uncompleted = p.dailyTasks.filter(t => !t.completed);
        const completed = p.dailyTasks.filter(t => t.completed);
        // Move uncompleted tasks to the end or next day (simulation)
        return { ...p, dailyTasks: [...completed, ...uncompleted] };
      }
      return p;
    }));
    alert('AI đã sắp xếp lại các nhiệm vụ chưa hoàn thành của bạn!');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-text">Lộ trình học tập thông minh</h2>
          <p className="text-text-muted mt-1">AI cá nhân hóa lộ trình học tập dựa trên mục tiêu và thời gian của bạn.</p>
        </div>
        <button 
          onClick={() => setShowGenerator(true)}
          className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
        >
          <Plus className="w-6 h-6" />
          Tạo lộ trình mới
        </button>
      </div>

      <AnimatePresence>
        {showGenerator && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card rounded-[3rem] p-10 border border-border shadow-2xl overflow-hidden"
          >
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
                <Plus className="w-4 h-4" /> Tự lập kế hoạch
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-3">Môn học / Kỹ năng</label>
                  <input 
                    type="text" 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder={generatorMode === 'ai' ? "Ví dụ: Kinh tế vi mô, SQL..." : "Nhập tên môn học..."}
                    className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-1 focus:ring-primary outline-none transition-all font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-3">Ngày thi</label>
                    <input 
                      type="date" 
                      value={formData.examDate}
                      onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                      className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-1 focus:ring-primary outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-3">Mục tiêu GPA</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="4.0"
                      value={formData.gpaTarget}
                      onChange={(e) => setFormData({...formData, gpaTarget: e.target.value})}
                      className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-1 focus:ring-primary outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                {generatorMode === 'ai' && (
                  <div>
                    <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-3">Phần kiến thức còn yếu</label>
                    <textarea 
                      value={formData.weakTopics}
                      onChange={(e) => setFormData({...formData, weakTopics: e.target.value})}
                      placeholder="Ví dụ: Cung cầu, Đạo hàm, SQL Joins..."
                      className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-1 focus:ring-primary outline-none transition-all font-bold h-24 resize-none"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-6">
                {generatorMode === 'ai' ? (
                  <>
                    <div>
                      <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-3">Độ khó mong muốn</label>
                      <div className="flex gap-3">
                        {['easy', 'medium', 'hard'].map(d => (
                          <button
                            key={d}
                            onClick={() => setFormData({...formData, difficulty: d})}
                            className={cn(
                              "flex-1 py-4 rounded-2xl text-xs font-black border transition-all uppercase tracking-widest",
                              formData.difficulty === d ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-text-muted border-border hover:border-primary"
                            )}
                          >
                            {d === 'easy' ? 'Dễ' : d === 'medium' ? 'Vừa' : 'Khó'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-3">Thời gian học mỗi ngày (giờ)</label>
                      <input 
                        type="number" 
                        value={formData.availableTime}
                        onChange={(e) => setFormData({...formData, availableTime: e.target.value})}
                        className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-1 focus:ring-primary outline-none transition-all font-bold"
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-10 bg-slate-50 rounded-[2rem] border border-dashed border-border text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-text-muted mb-4 shadow-sm">
                      <Plus className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-text-muted font-bold">Bạn sẽ tự thêm các nhiệm vụ và mục tiêu sau khi tạo kế hoạch.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => setShowGenerator(false)}
                className="flex-1 py-5 bg-slate-100 text-text-muted rounded-[2rem] font-black hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={generatorMode === 'ai' ? generatePlan : createManualPlan}
                disabled={loading || (generatorMode === 'manual' && !formData.subject)}
                className="flex-[2] py-5 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : generatorMode === 'ai' ? <Sparkles className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                {loading ? 'Đang soạn lộ trình...' : generatorMode === 'ai' ? 'AI Tạo lộ trình học' : 'Tạo kế hoạch thủ công'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {plans.map((plan) => (
          <motion.div 
            layout
            key={plan.id}
            className={cn(
              "bg-card rounded-[3rem] border border-border shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-xl",
              plan.isExamRush && "ring-2 ring-danger/20 border-danger/30"
            )}
          >
            <div className={cn(
              "p-8 border-b border-border flex items-center justify-between",
              plan.isExamRush ? "bg-danger/5" : "bg-slate-50/50"
            )}>
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
                  plan.isExamRush ? "bg-danger text-white" : "bg-primary text-white"
                )}>
                  {plan.isExamRush ? <Zap className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-xl text-text">{plan.subject}</h3>
                    {plan.isExamRush && (
                      <span className="px-3 py-1 bg-danger text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                        Exam Rush
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-text-muted uppercase font-black tracking-widest">
                      <Calendar className="w-3 h-3" /> {plan.examDate || 'No Deadline'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                      Tiến độ: {plan.progress}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => autoRearrange(plan.id)}
                  className="p-3 text-primary hover:bg-primary/5 rounded-xl transition-all"
                  title="Tự động sắp xếp lại"
                >
                  <Zap className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => addTaskManually(plan.id)}
                  className="p-3 text-success hover:bg-success/5 rounded-xl transition-all"
                  title="Thêm nhiệm vụ"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => deletePlan(plan.id)}
                  className="p-3 text-text-muted hover:text-danger hover:bg-danger/5 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Nhiệm vụ hàng ngày
                </h4>
                <div className="space-y-4">
                  {plan.dailyTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-4 group/task">
                      <button 
                        onClick={() => toggleTask(plan.id, task.id)}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                          task.completed ? "bg-success border-success" : "border-slate-200 group-hover/task:border-primary"
                        )}
                      >
                        {task.completed && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1">
                        {editingTaskId?.taskId === task.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              autoFocus
                              type="text" 
                              value={task.text}
                              onChange={(e) => updateTaskText(plan.id, task.id, e.target.value)}
                              onBlur={() => setEditingTaskId(null)}
                              onKeyPress={(e) => e.key === 'Enter' && setEditingTaskId(null)}
                              className="w-full bg-slate-50 px-3 py-1 rounded-lg border border-primary outline-none text-sm font-bold"
                            />
                            <button onClick={() => setEditingTaskId(null)}><Check className="w-4 h-4 text-success" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group/edit">
                            <p className={cn(
                              "text-sm font-bold transition-colors",
                              task.completed ? "text-text-muted line-through" : "text-text group-hover/task:text-primary"
                            )}>
                              {task.text}
                            </p>
                            <button 
                              onClick={() => setEditingTaskId({ planId: plan.id, taskId: task.id })}
                              className="opacity-0 group-hover/edit:opacity-100 transition-opacity p-1 text-text-muted hover:text-primary"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {task.startTime && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                              {task.startTime} - {task.endTime}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                              task.priority === 'high' ? "bg-danger/10 text-danger" : task.priority === 'medium' ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                            )}>
                              {task.priority}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <Target className="w-4 h-4 text-success" />
                  Mục tiêu tuần này
                </h4>
                <div className="space-y-4">
                  {plan.weeklyGoals.map((goal, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-border relative overflow-hidden group/goal">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-success opacity-50 group-hover/goal:opacity-100 transition-opacity" />
                      <p className="text-xs font-bold text-text leading-relaxed">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-border mt-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tiến độ hoàn thành</span>
                <span className="text-xs font-black text-primary">{plan.progress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-6 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${plan.progress}%` }}
                  className={cn(
                    "h-full transition-all duration-1000",
                    plan.isExamRush ? "bg-danger" : "bg-primary"
                  )}
                />
              </div>
              <button className="w-full py-4 bg-white border border-border text-text font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-sm shadow-sm group/sync">
                Đồng bộ hóa với lịch Google
                <ArrowRight className="w-4 h-4 group-hover/sync:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}

        {plans.length === 0 && !showGenerator && (
          <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
              <Calendar className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-text mb-3">Chưa có lộ trình học tập</h3>
            <p className="text-text-muted max-w-md mb-10 font-medium">Hãy để AI giúp bạn xây dựng lộ trình học tập tối ưu cho từng môn học dựa trên mục tiêu GPA của bạn.</p>
            <button 
              onClick={() => setShowGenerator(true)}
              className="px-10 py-5 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all text-lg"
            >
              Tạo lộ trình đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
