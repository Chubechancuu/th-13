import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX, 
  Coffee, 
  Brain, 
  Trophy,
  History,
  TrendingUp,
  Zap,
  Maximize2,
  Sparkles,
  Music,
  Wind,
  Waves,
  X
} from 'lucide-react';
import { UserProfile, PomodoroSettings } from '../types';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export default function PomodoroFocus({ profile, onUpdateProfile }: { profile: UserProfile, onUpdateProfile: (p: UserProfile) => void }) {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem('pomodoro_settings');
    return saved ? JSON.parse(saved) : {
      focusTime: 25,
      shortBreak: 5,
      longBreak: 15,
      rounds: 4,
      autoStart: false,
      sound: 'none'
    };
  });

  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [currentRound, setCurrentRound] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<{ date: string, focusTime: number }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
    if (!isActive) {
      setTimeLeft((mode === 'focus' ? settings.focusTime : mode === 'short' ? settings.shortBreak : settings.longBreak) * 60);
    }
  }, [settings]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive && settings.sound !== 'none' && !isMuted) {
      // In a real app, we'd have actual audio files. For now, we simulate.
      console.log(`Playing background sound: ${settings.sound}`);
    }
  }, [isActive, settings.sound, isMuted]);

  const handleComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (mode === 'focus') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#f59e0b']
      });

      onUpdateProfile({
        ...profile,
        focusTime: profile.focusTime + settings.focusTime,
        xp: profile.xp + 20
      });

      if (currentRound < settings.rounds) {
        setMode('short');
        setTimeLeft(settings.shortBreak * 60);
      } else {
        setMode('long');
        setTimeLeft(settings.longBreak * 60);
        setCurrentRound(1);
      }
      
      const today = new Date().toLocaleDateString();
      setHistory(prev => {
        const existing = prev.find(h => h.date === today);
        if (existing) {
          return prev.map(h => h.date === today ? { ...h, focusTime: h.focusTime + settings.focusTime } : h);
        }
        return [...prev, { date: today, focusTime: settings.focusTime }];
      });
    } else {
      setMode('focus');
      setTimeLeft(settings.focusTime * 60);
      if (mode === 'short') setCurrentRound(prev => prev + 1);
    }

    if (settings.autoStart) setIsActive(true);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setMode('focus');
    setTimeLeft(settings.focusTime * 60);
    setCurrentRound(1);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "max-w-4xl mx-auto space-y-8 pb-12 transition-all duration-500",
      isFullscreen && "fixed inset-0 z-[100] bg-white p-8 flex flex-col items-center justify-center overflow-auto"
    )}>
      {isFullscreen && (
        <button 
          onClick={() => setIsFullscreen(false)}
          className="absolute top-8 right-8 p-4 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {!isFullscreen && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-text">Tập trung tối đa</h2>
            <p className="text-text-muted mt-1">Sử dụng kỹ thuật Pomodoro để tối ưu hóa hiệu suất học tập.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsFullscreen(true)}
              className="p-3 bg-white border border-border rounded-2xl text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm"
            >
              <Maximize2 className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white border border-border rounded-2xl text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 bg-white border border-border rounded-2xl text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}

      <div className={cn("grid grid-cols-1 gap-8", !isFullscreen && "lg:grid-cols-3")}>
        {/* Main Timer */}
        <div className={cn("space-y-8", !isFullscreen && "lg:col-span-2")}>
          <div className={cn(
            "bg-card rounded-[3rem] p-12 border border-border shadow-2xl relative overflow-hidden transition-all duration-500",
            mode === 'focus' ? "ring-4 ring-primary/5" : mode === 'short' ? "ring-4 ring-success/5" : "ring-4 ring-warning/5",
            isFullscreen && "w-full max-w-2xl"
          )}>
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex gap-4 mb-12 flex-wrap justify-center">
                {[
                  { id: 'focus', label: 'Tập trung', icon: Brain, color: 'primary' },
                  { id: 'short', label: 'Nghỉ ngắn', icon: Coffee, color: 'success' },
                  { id: 'long', label: 'Nghỉ dài', icon: Clock, color: 'warning' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id as any);
                      setTimeLeft((m.id === 'focus' ? settings.focusTime : m.id === 'short' ? settings.shortBreak : settings.longBreak) * 60);
                      setIsActive(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all border",
                      mode === m.id 
                        ? `bg-${m.color} text-white border-${m.color} shadow-lg shadow-${m.color}/20` 
                        : "bg-slate-50 text-text-muted border-border hover:border-primary"
                    )}
                  >
                    <m.icon className="w-4 h-4" />
                    {m.label}
                  </button>
                ))}
              </div>

              <div className={cn(
                "font-display font-black text-text tracking-tighter tabular-nums leading-none mb-12",
                isFullscreen ? "text-[15rem]" : "text-[10rem]"
              )}>
                {formatTime(timeLeft)}
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={toggleTimer}
                  className={cn(
                    "w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all hover:scale-105 active:scale-95",
                    isActive ? "bg-danger shadow-danger/20" : "bg-primary shadow-primary/20"
                  )}
                >
                  {isActive ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white ml-1" />}
                </button>
                <button 
                  onClick={resetTimer}
                  className="w-16 h-16 rounded-2xl bg-slate-100 text-text-muted flex items-center justify-center hover:bg-slate-200 transition-all"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-12 flex items-center gap-4">
                <div className="flex gap-2">
                  {Array.from({ length: settings.rounds }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-3 h-3 rounded-full transition-all",
                        i + 1 < currentRound ? "bg-success" : i + 1 === currentRound && mode === 'focus' ? "bg-primary animate-pulse" : "bg-slate-200"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
                  Vòng {currentRound} / {settings.rounds}
                </span>
              </div>
            </div>
          </div>

          {!isFullscreen && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-border shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Tổng thời gian</p>
                  <p className="text-3xl font-black text-text">{profile.focusTime} <span className="text-sm font-bold">phút</span></p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-border shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center text-warning">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Chuỗi tập trung</p>
                  <p className="text-3xl font-black text-text">{profile.streak} <span className="text-sm font-bold">ngày</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        {!isFullscreen && (
          <div className="space-y-8">
            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-card rounded-3xl p-8 border border-border shadow-xl space-y-6"
                >
                  <h3 className="font-display font-bold text-lg text-text flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Cài đặt
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Tập trung: {settings.focusTime}m</label>
                      <input 
                        type="range" min="5" max="90" step="5" 
                        value={settings.focusTime}
                        onChange={(e) => setSettings({...settings, focusTime: Number(e.target.value)})}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Nghỉ ngắn: {settings.shortBreak}m</label>
                      <input 
                        type="range" min="1" max="30" step="1" 
                        value={settings.shortBreak}
                        onChange={(e) => setSettings({...settings, shortBreak: Number(e.target.value)})}
                        className="w-full accent-success"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Âm thanh nền</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'none', label: 'Tắt', icon: VolumeX },
                          { id: 'rain', label: 'Mưa', icon: Waves },
                          { id: 'cafe', label: 'Cafe', icon: Music },
                          { id: 'white-noise', label: 'Tiếng ồn', icon: Wind }
                        ].map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSettings({...settings, sound: s.id as any})}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-xl text-[10px] font-bold border transition-all",
                              settings.sound === s.id ? "bg-primary text-white border-primary" : "bg-slate-50 text-text-muted border-border"
                            )}
                          >
                            <s.icon className="w-3 h-3" />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Tự động bắt đầu</span>
                      <button 
                        onClick={() => setSettings({...settings, autoStart: !settings.autoStart})}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative p-1",
                          settings.autoStart ? "bg-primary" : "bg-slate-200"
                        )}
                      >
                        <div className={cn("w-4 h-4 bg-white rounded-full transition-all", settings.autoStart ? "translate-x-6" : "translate-x-0")} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="font-display font-bold text-sm text-text mb-6 uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Lịch sử gần đây
              </h3>
              <div className="space-y-4">
                {history.length > 0 ? history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-border">
                    <span className="text-xs font-bold text-text-muted">{h.date}</span>
                    <span className="text-sm font-black text-text">{h.focusTime}m</span>
                  </div>
                )) : (
                  <p className="text-xs text-text-muted text-center py-4 italic">Chưa có dữ liệu tập trung.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
