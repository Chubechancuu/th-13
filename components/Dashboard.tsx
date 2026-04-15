import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Target, 
  Clock, 
  Trophy, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  Briefcase, 
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Library,
  Mic,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sword,
  Map,
  Settings as SettingsIcon,
  Star,
  Flame,
  Award,
  Lightbulb,
  Play
} from 'lucide-react';
import { UserProfile, Task, StudyPlan } from '../types';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';

const chartData = [
  { name: 'T2', focus: 45, xp: 120 },
  { name: 'T3', focus: 52, xp: 150 },
  { name: 'T4', focus: 38, xp: 100 },
  { name: 'T5', focus: 65, xp: 200 },
  { name: 'T6', focus: 48, xp: 130 },
  { name: 'T7', focus: 70, xp: 250 },
  { name: 'CN', focus: 30, xp: 80 },
];

export default function Dashboard({ profile, onUpdateProfile, onNavigate }: { 
  profile: UserProfile, 
  onUpdateProfile: (p: UserProfile) => void,
  onNavigate: (tab: string) => void
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [isExamMode, setIsExamMode] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('career_hub_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    // Check for exam mode
    const savedPlans = localStorage.getItem('career_hub_plans');
    if (savedPlans) {
      const plans: StudyPlan[] = JSON.parse(savedPlans);
      const nearExam = plans.some(p => {
        if (!p.examDate) return false;
        const examDate = new Date(p.examDate);
        const diff = examDate.getTime() - Date.now();
        return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // Within 7 days
      });
      setIsExamMode(nearExam);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('career_hub_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      category: 'study',
      priority: 'medium'
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const completed = !t.completed;
        if (completed) {
          onUpdateProfile({
            ...profile,
            xp: profile.xp + 10,
            completedTasks: profile.completedTasks + 1
          });
        }
        return { ...t, completed };
      }
      return t;
    }));
  };

  const stats = [
    { label: 'Cấp độ', value: profile.level, icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Kinh nghiệm', value: `${profile.xp} XP`, icon: Trophy, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Tập trung', value: `${profile.focusTime}m`, icon: Clock, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Chuỗi ngày', value: profile.streak, icon: Flame, color: 'text-danger', bg: 'bg-danger/10' },
  ];

  const quickShortcuts = [
    { id: 'learning', label: 'Học tập', icon: Library, color: 'bg-blue-500' },
    { id: 'planner', label: 'Lịch học', icon: Calendar, color: 'bg-indigo-500' },
    { id: 'pomodoro', label: 'Tập trung', icon: Clock, color: 'bg-orange-500' },
    { id: 'tutor', label: 'AI Tutor', icon: BookOpen, color: 'bg-purple-500' },
    { id: 'roadmap', label: 'Lộ trình', icon: Map, color: 'bg-emerald-500' },
    { id: 'arena', label: 'Đấu trường', icon: Sword, color: 'bg-rose-500' },
    { id: 'settings', label: 'Cài đặt', icon: SettingsIcon, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Hero */}
      <section className={cn(
        "relative overflow-hidden rounded-[3rem] p-12 lg:p-16 text-white shadow-2xl transition-all duration-700",
        isExamMode 
          ? "bg-gradient-to-br from-rose-600 via-rose-500 to-rose-700" 
          : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      )}>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Sparkles className="w-full h-full text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            {isExamMode ? <Zap className="w-4 h-4 text-warning animate-pulse" /> : <Star className="w-4 h-4 text-primary" />}
            {isExamMode ? "Chế độ ôn thi cấp tốc đang bật" : "AI Student Companion v3.0"}
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
            Chào buổi tối, <br />
            <span className="text-primary">{profile.name.split(' ').pop()}</span> 👋
          </h1>
          <p className="text-slate-300 text-lg lg:text-xl mb-10 leading-relaxed font-medium max-w-xl">
            {isExamMode 
              ? "Kỳ thi đang đến rất gần! AI đã ưu tiên các môn học quan trọng nhất để bạn bứt phá điểm số."
              : `Hôm nay là một ngày tuyệt vời để nâng cấp kỹ năng ${profile.major}. Bạn đã sẵn sàng chưa?`}
          </p>
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={() => onNavigate('learning')}
              className="px-10 py-5 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3"
            >
              Tiếp tục học tập
              <ChevronRight className="w-6 h-6" />
            </button>
            <button 
              onClick={() => onNavigate('planner')}
              className="px-10 py-5 bg-white/10 backdrop-blur-md text-white rounded-[2rem] font-black border border-white/10 hover:bg-white/20 transition-all"
            >
              Xem lịch học
            </button>
          </div>
        </div>
      </section>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-6">
        {quickShortcuts.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center gap-4 p-6 bg-white rounded-[2.5rem] border border-border hover:border-primary hover:shadow-2xl transition-all group"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform", item.color)}>
              <item.icon className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card p-8 lg:p-10 rounded-[3rem] border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className={cn("w-14 h-14 lg:w-16 lg:h-16 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
              <stat.icon className="w-7 h-7 lg:w-8 lg:h-8" />
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-3xl lg:text-4xl font-black text-text">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          {/* Analytics Preview */}
          <div className="bg-card rounded-[3rem] p-10 lg:p-12 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-text flex items-center gap-4">
                <TrendingUp className="w-7 h-7 text-success" />
                Hiệu suất học tập
              </h3>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-text-muted uppercase tracking-widest">7 ngày qua</span>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  />
                  <Area type="monotone" dataKey="focus" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorFocus)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Challenge */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Trophy className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-warning/20 rounded-2xl flex items-center justify-center text-warning">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Thử thách hàng ngày</h3>
                  <p className="text-slate-400 font-medium">Hoàn thành để nhận x2 XP</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 mb-8">
                <h4 className="text-xl font-bold mb-4">"Chuyên gia {profile.major}"</h4>
                <p className="text-slate-300 mb-6 leading-relaxed">Hoàn thành 3 bài tập trắc nghiệm mức độ Khó trong Đấu trường Học thuật hôm nay.</p>
                <div className="flex items-center gap-6">
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-warning w-1/3 rounded-full" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">1/3 Hoàn thành</span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('learning')}
                className="px-10 py-5 bg-warning text-slate-900 rounded-[2rem] font-black shadow-xl shadow-warning/20 hover:scale-105 transition-all flex items-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                Bắt đầu thử thách
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-10">
          {/* Tasks Section */}
          <div className="bg-card rounded-[3rem] p-10 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-text uppercase tracking-[0.2em] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Nhiệm vụ
              </h3>
              <button onClick={() => onNavigate('planner')} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">Xem hết</button>
            </div>

            <div className="flex gap-3 mb-8">
              <input 
                type="text" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Thêm việc cần làm..."
                className="flex-1 bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold text-xs"
              />
              <button onClick={addTask} className="w-12 h-12 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-border transition-all group">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        task.completed ? "bg-success border-success" : "border-slate-300"
                      )}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                    <span className={cn("text-sm font-bold truncate max-w-[150px]", task.completed && "line-through text-text-muted")}>
                      {task.title}
                    </span>
                  </div>
                  <button className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-text-muted font-bold italic">Chưa có nhiệm vụ nào.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Advice */}
          <div className="bg-white p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-5">
              <Lightbulb className="w-24 h-24" />
            </div>
            <h3 className="text-sm font-black text-text uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              Gợi ý từ AI
            </h3>
            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 mb-6">
              <p className="text-sm text-text font-bold leading-relaxed italic">
                "Dựa trên lịch sử học tập, bạn đang có xu hướng tập trung tốt nhất vào khoảng 8h-10h tối. Hãy dành thời gian này cho các môn khó nhất nhé!"
              </p>
            </div>
            <button 
              onClick={() => onNavigate('tutor')}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
            >
              Trò chuyện với AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
