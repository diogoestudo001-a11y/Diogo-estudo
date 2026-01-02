
import React, { useState } from 'react';
import { 
  Save, 
  CheckCircle2, 
  Calculator, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import Tooltip from '../components/Tooltip';

interface DisciplinePerformance {
  id: string;
  name: string;
  correct: number;
  wrong: number;
}

const PerformanceView: React.FC = () => {
  const [performances, setPerformances] = useState<DisciplinePerformance[]>([
    { id: '1', name: 'Língua Portuguesa', correct: 150, wrong: 30 },
    { id: '2', name: 'Direito Penal', correct: 220, wrong: 45 },
    { id: '3', name: 'Informática', correct: 80, wrong: 60 },
    { id: '4', name: 'Raciocínio Lógico', correct: 95, wrong: 40 },
    { id: '5', name: 'Criminologia', correct: 110, wrong: 25 },
    { id: '6', name: 'Direito Constitucional', correct: 180, wrong: 35 },
    { id: '7', name: 'Direito Administrativo', correct: 140, wrong: 55 }
  ]);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleUpdate = (id: string, field: 'correct' | 'wrong', value: string) => {
    const numValue = parseInt(value) || 0;
    setPerformances(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: numValue } : p
    ));
  };

  const handleSave = (id: string) => {
    const item = performances.find(p => p.id === id);
    setSaveStatus(id);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const calculateTotal = (correct: number, wrong: number) => correct + wrong;

  const calculatePercent = (correct: number, wrong: number) => {
    const total = calculateTotal(correct, wrong);
    if (total === 0) return 0;
    return (correct / total) * 100;
  };

  const getPerformanceColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (percent >= 60) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getPerformanceLabel = (percent: number) => {
    if (percent >= 80) return 'Excelente';
    if (percent >= 60) return 'Regular';
    return 'Insuficiente';
  };

  return (
    <div className="space-y-6 pb-10">
      <header>
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Calculator className="text-blue-500" />
          Desempenho em Questões
        </h2>
        <p className="text-slate-400 mt-1">Controle estatístico de acertos e erros por disciplina.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 hover:border-blue-500/30 transition-colors">
          <div className="bg-emerald-500/20 p-2 rounded-lg"><TrendingUp className="text-emerald-500" size={20} /></div>
          <div>
            <Tooltip text="Mínimo aceitável para aprovação em concursos de alto nível.">
              <p className="text-xs font-bold text-slate-500 uppercase">Meta Operacional</p>
            </Tooltip>
            <p className="text-lg font-bold">Mínimo 80%</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 hover:border-blue-500/30 transition-colors">
          <div className="bg-blue-500/20 p-2 rounded-lg"><CheckCircle2 className="text-blue-500" size={20} /></div>
          <div>
            <Tooltip text="Soma de todas as questões respondidas corretamente.">
              <p className="text-xs font-bold text-slate-500 uppercase">Total de Acertos</p>
            </Tooltip>
            <p className="text-lg font-bold">{performances.reduce((acc, curr) => acc + curr.correct, 0)}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 hover:border-blue-500/30 transition-colors">
          <div className="bg-slate-800 p-2 rounded-lg"><AlertCircle className="text-slate-400" size={20} /></div>
          <div>
            <Tooltip text="Média percentual ponderada de todas as matérias.">
              <p className="text-xs font-bold text-slate-500 uppercase">Média Geral</p>
            </Tooltip>
            <p className="text-lg font-bold">
              {Math.round(performances.reduce((acc, curr) => acc + calculatePercent(curr.correct, curr.wrong), 0) / performances.length)}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-slate-500 font-black uppercase bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Disciplina</th>
                <th className="px-6 py-4 text-center">Certas</th>
                <th className="px-6 py-4 text-center">Erradas</th>
                <th className="px-6 py-4 text-center">Total</th>
                <th className="px-6 py-4 text-center">Desempenho</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {performances.map((item) => {
                const total = calculateTotal(item.correct, item.wrong);
                const percent = calculatePercent(item.correct, item.wrong);
                const statusColor = getPerformanceColor(percent);

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-200">{item.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <input 
                          type="number"
                          value={item.correct}
                          onChange={(e) => handleUpdate(item.id, 'correct', e.target.value)}
                          className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-emerald-400 font-mono focus:border-emerald-500 outline-none transition-colors"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <input 
                          type="number"
                          value={item.wrong}
                          onChange={(e) => handleUpdate(item.id, 'wrong', e.target.value)}
                          className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-red-400 font-mono focus:border-red-500 outline-none transition-colors"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-400 font-mono">
                      {total}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest font-mono ${statusColor}`}>
                          {Math.round(percent)}%
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">{getPerformanceLabel(percent)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleSave(item.id)}
                        className={`p-2 rounded-lg transition-all transform active:scale-90 ${
                          saveStatus === item.id 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-blue-600 shadow-lg'
                        }`}
                      >
                        {saveStatus === item.id ? <CheckCircle2 size={18} /> : <Save size={18} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="space-y-2">
          <h4 className="font-bold flex items-center gap-2 uppercase tracking-widest text-xs text-slate-400">
            <Calculator size={14} className="text-blue-500" />
            Legenda de Prontidão Operacional
          </h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">≥ 80% (Pronto para o Combate)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">60-79% (Reforçar Teoria)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">&lt; 60% (Revisão Imediata)</span>
            </div>
          </div>
        </div>
        
        <div className="text-right border-l border-slate-800 pl-6 hidden md:block">
          <p className="text-xs text-slate-500 font-bold italic">"O treinamento difícil torna o combate fácil."</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;
