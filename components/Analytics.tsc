import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Target, 
  Award, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Brain,
  CheckCircle2,
  Trophy,
  Star,
  Activity
} from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const studyData = [
  { name: 'T2', hours: 4.5, tasks: 8 },
  { name: 'T3', hours: 5.2, tasks: 12 },
  { name: 'T4', hours: 3.8, tasks: 6 },
  { name: 'T5', hours: 6.5, tasks: 15 },
  { name: 'T6', hours: 4.8, tasks: 10 },
  { name: 'T7', hours: 7.0, tasks: 20 },
  { name: 'CN', hours: 3.0, tasks: 5 },
];

const skillData = [
  { name: 'Marketing', value: 85 },
  { name: 'Finance', value: 65 },
  { name: 'Soft Skills', value: 90 },
  { name: 'Data Analysis', value: 45 },
  { name: 'Management', value: 70 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics({ profile }: { profile: UserProfile }) {
  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-text">Báo cáo năng lực</h2>
          <p className="text-text-muted mt-1">Phân tích chi tiết tiến độ học tập và phát triển kỹ năng của bạn.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white border border-border rounded-2xl text-sm font-bold text-text hover:bg-slate-50 transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4" /> 7 ngày qua
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
            Xuất báo cáo PDF
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tổng giờ học', value: '124h', change: '+12%', trend: 'up', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'XP Tích lũy', value: profile.xp, change: '+450', trend: 'up', icon: Zap, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Tỷ lệ hoàn thành', value: '92%', change: '+5%', trend: 'up', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Thứ hạng', value: '#12', change: '-2', trend: 'down', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                stat.trend === 'up' ? "text-success bg-success/10" : "text-danger bg-danger/10"
              )}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-card rounded-[3rem] p-10 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-text flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              Thời gian học tập & Nhiệm vụ
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Giờ học</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-300" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Nhiệm vụ</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
                <Area type="monotone" dataKey="tasks" stroke="#818cf8" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-card rounded-[3rem] p-10 border border-border shadow-sm">
          <h3 className="text-xl font-black text-text mb-10 flex items-center gap-3">
            <Brain className="w-6 h-6 text-warning" />
            Bản đồ kỹ năng
          </h3>
          <div className="space-y-8">
            {skillData.map((skill, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text">{skill.name}</span>
                  <span className="text-xs font-black text-primary">{skill.value}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Lời khuyên từ AI</h4>
            <p className="text-xs text-text-muted leading-relaxed italic">
              "Kỹ năng Soft Skills của bạn rất tốt, nhưng Data Analysis đang hơi thấp. Hãy dành thêm 2 tiếng mỗi tuần để học SQL nhé!"
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Achievements & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-card rounded-[3rem] p-10 border border-border shadow-sm">
          <h3 className="text-xl font-black text-text mb-8 flex items-center gap-3">
            <Star className="w-6 h-6 text-warning" />
            Thành tích gần đây
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Siêu tập trung', desc: 'Hoàn thành 10 phiên Pomodoro', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
              { title: 'Chiến binh học thuật', desc: 'Học liên tục trong 7 ngày', icon: Zap, color: 'text-warning', bg: 'bg-warning/10' },
              { title: 'Bậc thầy phỏng vấn', desc: 'Đạt 90 điểm phỏng vấn AI', icon: MessageSquare, color: 'text-success', bg: 'bg-success/10' },
              { title: 'Nhà hoạch định', desc: 'Tạo 5 lộ trình sự nghiệp', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((ach, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary/30 transition-all group">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform", ach.bg, ach.color)}>
                  <ach.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">{ach.title}</h4>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <TrendingUp className="w-64 h-64" />
          </div>
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Mục tiêu dài hạn
          </h3>
          <div className="space-y-6">
            {[
              { goal: 'Đạt chứng chỉ IELTS 7.5', progress: 75 },
              { goal: 'Hoàn thành khóa học Marketing', progress: 40 },
              { goal: 'Thực tập tại Big4', progress: 20 },
            ].map((goal, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>{goal.goal}</span>
                  <span className="text-primary">{goal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            Thêm mục tiêu mới <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
