
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert,
  Coffee,
  Brain,
  ChevronDown
} from 'lucide-react';
import Tooltip from '../components/Tooltip';
import { Subject } from '../types';

const StudyTimer: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(1500); // 25 mins
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('elite_study_subjects');
    if (saved) {
      const data = JSON.parse(saved) as Subject[];
      setSubjects(data);
      if (data.length > 0) setSelectedSubject(data[0]);
    }
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(interval);
      setIsActive(false);
      
      // Feedback sonoro (opcional)
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-3xl p-10 shadow-2xl text-center relative overflow-visible transition-all hover:border-blue-500/30">
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={() => { setMode('study'); setSeconds(1500); setIsActive(false); }}
            className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all transform active:scale-95 ${mode === 'study' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 bg-slate-800'}`}
          >
            <Brain size={14} className="mr-2" /> FOCO
          </button>
          <button 
            onClick={() => { setMode('break'); setSeconds(300); setIsActive(false); }}
            className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all transform active:scale-95 ${mode === 'break' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 bg-slate-800'}`}
          >
            <Coffee size={14} className="mr-2" /> PAUSA
          </button>
        </div>

        <div className="text-8xl font-black mb-10 tracking-tighter text-white font-mono">
          {formatTime(seconds)}
        </div>

        <div className="flex items-center justify-center space-x-6">
          <button 
            onClick={resetTimer} 
            className="p-4 bg-slate-800 text-slate-400 rounded-full hover:text-white transition-all active:rotate-180"
          >
            <RotateCcw size={24} />
          </button>
          
          <button 
            onClick={toggleTimer} 
            className={`p-8 rounded-full shadow-lg transform active:scale-90 transition-all ${isActive ? 'bg-red-600' : 'bg-blue-600 animate-pulse-slow'}`}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>

          <button 
            onClick={() => alert("Interrupção crítica registrada.")}
            className="p-4 bg-slate-800 text-slate-400 rounded-full hover:text-red-500 transition-all"
          >
            <ShieldAlert size={24} />
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800 relative">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Missão Operacional</p>
          <button 
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center justify-center space-x-2 w-full text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors py-2"
          >
            <span>{selectedSubject?.name || 'Selecione uma Disciplina'}</span>
            <ChevronDown size={18} className={`transition-transform ${showSelector ? 'rotate-180' : ''}`} />
          </button>

          {showSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto overflow-x-hidden animate-in">
              {subjects.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { setSelectedSubject(s); setShowSelector(false); }}
                  className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-700 border-b border-slate-700 last:border-0"
                >
                  {s.name}
                </button>
              ))}
              {subjects.length === 0 && (
                <div className="p-4 text-xs text-slate-500">Nenhuma disciplina cadastrada.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
