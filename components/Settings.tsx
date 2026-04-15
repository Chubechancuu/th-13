import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Database, 
  LogOut, 
  ChevronRight,
  Camera,
  Mail,
  Lock,
  Eye,
  Smartphone,
  CreditCard,
  Trash2,
  AlertCircle,
  Check,
  Zap,
  Target,
  Clock,
  BookOpen,
  GraduationCap,
  Briefcase,
  Heart,
  Save
} from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

export default function Settings({ profile, onUpdateProfile }: { 
  profile: UserProfile, 
  onUpdateProfile: (p: UserProfile) => void 
}) {
  const toggleTheme = () => {
    onUpdateProfile({
      ...profile,
      theme: profile.theme === 'dark' ? 'light' : 'dark'
    });
  };

  const toggleLanguage = () => {
    onUpdateProfile({
      ...profile,
      language: profile.language === 'vi' ? 'en' : 'vi'
    });
  };

  const updatePreference = (key: keyof UserProfile['studyPreferences'], value: boolean) => {
    onUpdateProfile({
      ...profile,
      studyPreferences: {
        ...profile.studyPreferences,
        [key]: value
      }
    });
  };

  const handleInterestChange = (interest: string) => {
    const newInterests = profile.interests.includes(interest)
      ? profile.interests.filter(i => i !== interest)
      : [...profile.interests, interest];
    onUpdateProfile({ ...profile, interests: newInterests });
  };

  const commonInterests = [
    'Lập trình', 'Thiết kế', 'Kinh doanh', 'Ngoại ngữ', 
    'Marketing', 'Dữ liệu', 'Tài chính', 'Quản trị'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-text">Cài đặt hệ thống</h2>
          <p className="text-text-muted mt-1 font-medium">Quản lý tài khoản và tùy chỉnh trải nghiệm cá nhân của bạn.</p>
        </div>
        <button className="px-8 py-4 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3">
          <Save className="w-5 h-5" /> Lưu thay đổi
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-card rounded-[3rem] p-12 border border-border shadow-sm flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <User className="w-48 h-48" />
        </div>
        <div className="relative group z-10">
          <div className="w-40 h-40 rounded-[3rem] bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border-8 border-white shadow-2xl">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
              alt="avatar" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
            />
          </div>
          <button className="absolute bottom-2 right-2 p-4 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-white">
            <Camera className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h3 className="text-3xl font-black text-text tracking-tight">{profile.name}</h3>
            <div className="flex gap-2 justify-center">
              <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">Level {profile.level}</span>
              <span className="px-4 py-1.5 bg-warning/10 text-warning rounded-full text-[10px] font-black uppercase tracking-widest">{profile.xp} XP</span>
            </div>
          </div>
          <p className="text-text-muted font-bold text-lg mb-8">{profile.major} • Năm {profile.year}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-border flex items-center gap-3">
              <Check className="w-5 h-5 text-success" />
              <span className="text-xs font-black text-text uppercase tracking-widest">{profile.streak} Ngày liên tiếp</span>
            </div>
            <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-border flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-xs font-black text-text uppercase tracking-widest">GPA Mục tiêu: {profile.goalGPA}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Account Info */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-6">Thông tin học thuật</h4>
          <div className="bg-card rounded-[3rem] border border-border shadow-sm p-10 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Họ và tên
              </label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => onUpdateProfile({...profile, name: e.target.value})}
                className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" /> Chuyên ngành
                </label>
                <input 
                  type="text" 
                  value={profile.major}
                  onChange={(e) => onUpdateProfile({...profile, major: e.target.value})}
                  className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Năm học
                </label>
                <select 
                  value={profile.year}
                  onChange={(e) => onUpdateProfile({...profile, year: Number(e.target.value)})}
                  className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                >
                  {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Năm {y}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Mục tiêu sự nghiệp
              </label>
              <input 
                type="text" 
                value={profile.careerGoal}
                onChange={(e) => onUpdateProfile({...profile, careerGoal: e.target.value})}
                className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Heart className="w-4 h-4 text-danger" /> Sở thích & Kỹ năng
              </label>
              <div className="flex flex-wrap gap-2">
                {commonInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestChange(interest)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      profile.interests.includes(interest) 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-white text-text-muted border-border hover:border-primary"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-6">Tùy chọn hệ thống</h4>
            <div className="bg-card rounded-[3rem] border border-border shadow-sm p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-text-muted">
                    {profile.theme === 'dark' ? <Moon className="w-7 h-7" /> : <Sun className="w-7 h-7" />}
                  </div>
                  <div>
                    <p className="font-black text-text">Giao diện hệ thống</p>
                    <p className="text-xs text-text-muted font-medium">Chế độ {profile.theme === 'dark' ? 'Tối' : 'Sáng'}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={cn(
                    "w-16 h-9 rounded-full transition-all relative p-1",
                    profile.theme === 'dark' ? "bg-primary" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 bg-white rounded-full transition-all shadow-md",
                    profile.theme === 'dark' ? "translate-x-7" : "translate-x-0"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-text-muted">
                    <Globe className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-black text-text">Ngôn ngữ hiển thị</p>
                    <p className="text-xs text-text-muted font-medium">{profile.language === 'vi' ? 'Tiếng Việt' : 'English'}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleLanguage}
                  className="px-6 py-3 bg-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Thay đổi
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-6">Tự động hóa AI</h4>
            <div className="bg-card rounded-[3rem] border border-border shadow-sm p-10 space-y-8">
              {[
                { key: 'autoRearrange', label: 'Tự động sắp xếp lịch', desc: 'AI tối ưu hóa khi bạn bỏ lỡ task', icon: Zap, color: 'text-warning' },
                { key: 'notifications', label: 'Thông báo nhắc nhở', desc: 'Nhận tin nhắn động viên từ AI Tutor', icon: Bell, color: 'text-primary' },
                { key: 'pomodoroFocus', label: 'Chế độ Pomodoro', desc: 'Tự động bật khi vào bài học mới', icon: Clock, color: 'text-success' }
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-text-muted">
                      <pref.icon className={cn("w-7 h-7", pref.color)} />
                    </div>
                    <div>
                      <p className="font-black text-text">{pref.label}</p>
                      <p className="text-xs text-text-muted font-medium">{pref.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updatePreference(pref.key as any, !profile.studyPreferences[pref.key as keyof UserProfile['studyPreferences']])}
                    className={cn(
                      "w-16 h-9 rounded-full transition-all relative p-1",
                      profile.studyPreferences[pref.key as keyof UserProfile['studyPreferences']] ? "bg-success" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 bg-white rounded-full transition-all shadow-md",
                      profile.studyPreferences[pref.key as keyof UserProfile['studyPreferences']] ? "translate-x-7" : "translate-x-0"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-danger uppercase tracking-[0.3em] ml-6">Vùng nguy hiểm</h4>
        <div className="bg-danger/5 rounded-[3rem] border border-danger/10 p-12 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[1.5rem] bg-danger/10 flex items-center justify-center text-danger shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xl font-black text-text">Xóa tài khoản vĩnh viễn</p>
              <p className="text-sm text-text-muted mt-1 font-medium leading-relaxed max-w-md">Tất cả dữ liệu học tập, tiến độ sự nghiệp và lịch sử trò chuyện AI sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
            </div>
          </div>
          <button className="px-10 py-5 bg-danger text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-danger/30 hover:bg-danger-dark transition-all flex items-center gap-3">
            <Trash2 className="w-5 h-5" /> Xóa tài khoản
          </button>
        </div>
      </div>

      <div className="pt-12 text-center space-y-8">
        <button className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm shadow-2xl hover:bg-black transition-all flex items-center gap-3 mx-auto">
          <LogOut className="w-5 h-5" /> Đăng xuất tài khoản
        </button>
        <div className="space-y-2">
          <p className="text-[10px] text-text-muted uppercase tracking-[0.4em] font-black">STUDENT HUB v3.0.0</p>
          <p className="text-[10px] text-text-muted font-bold">Made with ❤️ for Students • Powered by Gemini AI</p>
        </div>
      </div>
    </div>
  );
}
