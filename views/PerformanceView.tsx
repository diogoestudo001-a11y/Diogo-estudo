
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  CheckCircle2, 
  Calculator, 
  TrendingUp, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
  Info,
  Layers,
  TrendingDown,
  Minus
} from 'lucide-react';
import Tooltip from '../components/Tooltip';
import { Subject, Topic, StudyPlan } from '../types';

interface GroupedSubject {
  name: string;
  certas: number;
  erradas: number;
  plans: string[];
  color: string;
}

const PerformanceView: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('elite_study_subjects');
    if (saved) {
      setSubjects(JSON.parse(saved));
    }
    const savedPlans = localStorage.getItem('elite_study_plans');
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    }
  }, []);

  // Consolidação automática e silenciosa dos dados por nome de matéria (Case Insensitive)
  const groupedSubjects: GroupedSubject[] = subjects.reduce((acc, curr) => {
    const subjectNameNormalized = curr.name.trim();
    const existing = acc.find(item => item.name.toLowerCase() === subjectNameNormalized.toLowerCase());
    
    const plan = plans.find(p => p.examId === curr.examId);
    const planName = plan ? plan.examName : 'Geral';

    if (existing) {
      existing.certas += (curr.certas || 0);
      existing.erradas += (curr.erradas || 0);
      if (!existing.plans.includes(planName)) {
        existing.plans.push(planName);
      }
    } else {
      acc.push({
        name: subjectNameNormalized,
        certas: curr.certas || 0,
        erradas: curr.erradas || 0,
        plans: [planName],
        color: curr.color || 'text-blue-500'
      });
    }
    return acc;
  }, [] as GroupedSubject[]);

  const calculateTotal = (certas: number, erradas: number) => certas + erradas;

  const calculatePercent = (certas: number, erradas: number) => {
    const total = calculateTotal(certas, erradas);
    if (total === 0) return 0;
    return (certas / total) * 100;
  };

  const getPerformanceColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (percent >= 60) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getTrendIndicator = (percent: number, total: number) => {
    if (total === 0) return { icon: <Minus size={14} />, label: 'Sem dados', color: 'text-slate-600' };
    if (percent >= 85) return { icon: <TrendingUp size={14} />, label: 'Melhora', color: 'text-emerald-500' };
    if (percent >= 70) return { icon: <Minus size={14} />, label: 'Estabilidade', color: 'text-blue-500' };
    return { icon: <TrendingDown size={14} />, label: 'Queda', color: 'text-red-500' };
  };

  const getPerformanceLabel = (percent: number) => {
    if (percent >= 80) return 'Excelente';
    if (percent >= 60) return 'Regular';
    return 'Insuficiente';
  };

  const toggleExpand = (name: string) => {
    setExpandedSubject(expandedSubject === name ? null : name);
  };

  return (
    <div className="space-y-6 pb-10 animate-in">
      <header>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-xl text-blue-500">
            <Calculator size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Desempenho Geral</h2>
            <p className="text-slate-400 text-sm">Visão macro consolidada de todos os seus editais ativos.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-all shadow-lg">
          <div className="bg-emerald-500/10 p-3 rounded-xl"><TrendingUp className="text-emerald-500" size={24} /></div>
          <div>
            <Tooltip text="Meta de excelência para concursos de alto nível.">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status de Aprovação</p>
            </Tooltip>
            <p className="text-2xl font-black text-emerald-500">80% <span className="text-xs text-slate-500 font-medium">mínimo</span></p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-all shadow-lg">
          <div className="bg-blue-500/10 p-3 rounded-xl"><CheckCircle2 className="text-blue-500" size={24} /></div>
          <div>
            <Tooltip text="Soma total de acertos em todas as missões registradas.">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Acertos Globais</p>
            </Tooltip>
            <p className="text-2xl font-black">{groupedSubjects.reduce((acc, curr) => acc + curr.certas, 0)}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-all shadow-lg">
          <div className="bg-orange-500/10 p-3 rounded-xl"><Target className="text-orange-500" size={24} /></div>
          <div>
            <Tooltip text="Média aritmética de rendimento baseada em questões consolidadas.">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rendimento Médio</p>
            </Tooltip>
            <p className="text-2xl font-black text-orange-500">
              {groupedSubjects.length > 0 
                ? Math.round(groupedSubjects.reduce((acc, curr) => acc + calculatePercent(curr.certas, curr.erradas), 0) / groupedSubjects.length) 
                : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 p-4 rounded-2xl flex items-center gap-4">
        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
           <Info size={20} />
        </div>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          Os dados abaixo são sincronizados <strong>automaticamente</strong> conforme você preenche o desempenho nas abas individuais de cada Plano de Estudos. Esta é a sua visão estratégica macro.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-slate-500 font-black uppercase bg-slate-800/30">
              <tr>
                <th className="px-8 py-5">Disciplina Consolidada</th>
                <th className="px-6 py-5 text-center">Certas</th>
                <th className="px-6 py-5 text-center">Erradas</th>
                <th className="px-6 py-5 text-center">Percentual</th>
                <th className="px-6 py-5 text-center">Evolução</th>
                <th className="px-8 py-5 text-right">Origens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {groupedSubjects.sort((a, b) => calculatePercent(b.certas, b.erradas) - calculatePercent(a.certas, a.erradas)).map((item) => {
                const total = calculateTotal(item.certas, item.erradas);
                const percent = calculatePercent(item.certas, item.erradas);
                const statusColor = getPerformanceColor(percent);
                const trend = getTrendIndicator(percent, total);
                const isExpanded = expandedSubject === item.name;

                return (
                  <React.Fragment key={item.name}>
                    <tr 
                      className={`hover:bg-slate-800/40 transition-all cursor-pointer group ${isExpanded ? 'bg-slate-800/30' : ''}`}
                      onClick={() => toggleExpand(item.name)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl bg-slate-800/50 ${item.color} group-hover:scale-110 transition-transform`}>
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{item.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{total} questões totais</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center font-mono text-emerald-400 font-bold">
                        {item.certas}
                      </td>
                      <td className="px-6 py-5 text-center font-mono text-red-400 font-bold">
                        {item.erradas}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`px-3 py-1 rounded-full border text-[10px] font-black tracking-widest font-mono ${statusColor}`}>
                            {Math.round(percent)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className={`flex items-center justify-center gap-1.5 ${trend.color} text-[10px] font-black uppercase tracking-tighter`}>
                            {trend.icon}
                            <span>{trend.label}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end text-slate-500">
                          {isExpanded ? <ChevronUp size={20} className="text-blue-500" /> : <ChevronDown size={20} />}
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-950/40 border-l-4 border-l-blue-600 animate-in slide-in-from-left-2">
                        <td colSpan={6} className="px-8 py-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Layers size={14} className="text-blue-500" />
                              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Planos de Estudo Vinculados</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.plans.map(pName => (
                                <span key={pName} className="bg-blue-600/10 text-blue-400 px-4 py-1.5 rounded-xl text-[10px] font-bold border border-blue-500/20 shadow-sm">
                                  {pName}
                                </span>
                              ))}
                            </div>
                            <div className="pt-2">
                               <p className="text-[9px] text-slate-600 font-bold uppercase">Nota: O desempenho adaptativo individual continua sendo processado separadamente por plano.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {groupedSubjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-black uppercase tracking-widest text-xs">
                    Nenhum dado consolidado operacional. Inicie os registros nos planos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row gap-10 items-center justify-between shadow-inner">
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            <h4 className="font-black uppercase tracking-widest text-xs text-slate-400">Indicadores de Evolução Consolidada</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><TrendingUp size={16} /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block">Melhora</span>
                <span className="text-[9px] text-slate-600 font-bold">Rendimento acima de 85%</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500"><Minus size={16} /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block">Estabilidade</span>
                <span className="text-[9px] text-slate-600 font-bold">Rendimento entre 70-84%</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500"><TrendingDown size={16} /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block">Queda</span>
                <span className="text-[9px] text-slate-600 font-bold">Rendimento abaixo de 70%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;
