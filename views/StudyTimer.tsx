
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert,
  Coffee,
  Brain
} from 'lucide-react';

const StudyTimer: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(1500); // 25 mins
  const [mode, setMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(interval);
      setIsActive(false);
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
      audio.play().catch(() => {});
      alert(mode === 'study' ? "Ciclo concluído! Descanse." : "Pausa terminada! De volta ao combate.");
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === 'study' ? 1500 : 300);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden">
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={() => { setMode('study'); setSeconds(1500); setIsActive(false); }}
            className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === 'study' ? 'bg-blue-600 text-white' : 'text-slate-500 bg-slate-800'}`}
          >
            <Brain size={14} className="mr-2" /> FOCO
          </button>
          <button 
            onClick={() => { setMode('break'); setSeconds(300); setIsActive(false); }}
            className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === 'break' ? 'bg-green-600 text-white' : 'text-slate-500 bg-slate-800'}`}
          >
            <Coffee size={14} className="mr-2" /> PAUSA
          </button>
        </div>

        <div className="text-8xl font-black mb-10 tracking-tighter text-white font-mono">
          {formatTime(seconds)}
        </div>

        <div className="flex items-center justify-center space-x-6">
          <button onClick={resetTimer} className="p-4 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700">
            <RotateCcw size={24} />
          </button>
          <button 
            onClick={toggleTimer} 
            className={`p-8 rounded-full shadow-lg transform active:scale-95 transition-all ${isActive ? 'bg-red-600' : 'bg-blue-600'}`}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <div className="p-4 bg-slate-800 text-slate-400 rounded-full">
            <ShieldAlert size={24} />
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Missão Atual</p>
          <p className="text-lg font-bold text-blue-400">Direito Penal - Teoria do Crime</p>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
