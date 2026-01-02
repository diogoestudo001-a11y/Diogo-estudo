
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
  Info
} from 'lucide-react';
import Tooltip from '../components/Tooltip';
import { Subject, Topic } from '../types';

const PerformanceView: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
  const [topicsMap, setTopicsMap] = useState<Record<number, Topic[]>>({});

  useEffect(() => {
    const saved = localStorage.getItem('elite_study_subjects');
    if (saved) {
      setSubjects(JSON.parse(saved));
    }
  }, []);

  const toggleExpand = (subjectId: number) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(subjectId);
      // Sincronização automática: Carrega os assuntos definidos na aba Disciplinas
      const savedTopics = localStorage.getItem(`elite_study_topics_${subjectId}`);
      if (savedTopics) {
        setTopicsMap(prev => ({
          ...prev,
          [subjectId]: JSON.parse(savedTopics)
        }));
      } else {
        setTopicsMap(prev => ({
          ...prev,
          [subjectId]: []
        }));
      }
    }
  };

  const handleTopicUpdate = (subjectId: number, topicId: number, field: 'certas' | 'erradas', value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    
    // 1. Atualizar Tópico no Map local (proveniente da aba Disciplinas)
    const subjectTopics = topicsMap[subjectId] || [];
    const updatedTopics = subjectTopics.map(t => t.id === topicId ? { ...t, [field]: numValue } : t);
    
    setTopicsMap(prev => ({
      ...prev,
      [subjectId]: updatedTopics
    }));

    // 2. Persistir Tópicos no localStorage (mantendo integridade referencial)
    localStorage.setItem(`elite_study_topics_${subjectId}`, JSON.stringify(updatedTopics));

    // 3. Recalcular Totais da Disciplina AUTOMATICAMENTE
    const totalCertas = updatedTopics.reduce((acc, t) => acc + (t.certas || 0), 0);
    const totalErradas = updatedTopics.reduce((acc, t) => acc + (t.erradas || 0), 0);

    // 4. Atualizar Disciplina no Estado e localStorage
    const updatedSubjects = subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, certas: totalCertas, erradas: totalErradas };
      }
      return s;
    });

    setSubjects(updatedSubjects);
    localStorage.setItem('elite_study_subjects', JSON.stringify(updatedSubjects));
  };

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
          Desempenho Operacional
        </h2>
        <p className="text-slate-400 mt-1">Status detalhado por assunto do edital.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 hover:border-blue-500/30 transition-colors">
          <div className="bg-emerald-500/20 p-2 rounded-lg"><TrendingUp className="text-emerald-500" size={20} /></div>
          <div>
            <Tooltip text="Meta mínima de aprovação para carreiras policiais.">
              <p className="text-xs font-bold text-slate-500 uppercase">Aproveitamento Alvo</p>
            </Tooltip>
            <p className="text-lg font-bold">80%</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 hover:border-blue-500/30 transition-colors">
          <div className="bg-blue-500/20 p-2 rounded-lg"><CheckCircle2 className="text-blue-500" size={20} /></div>
          <div>
            <Tooltip text="Soma automática de todos os acertos em todos os assuntos.">
              <p className="text-xs font-bold text-slate-500 uppercase">Acertos Globais</p>
            </Tooltip>
            <p className="text-lg font-bold">{subjects.reduce((acc, curr) => acc + (curr.certas || 0), 0)}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 hover:border-blue-500/30 transition-colors">
          <div className="bg-slate-800 p-2 rounded-lg"><AlertCircle className="text-slate-400" size={20} /></div>
          <div>
            <Tooltip text="Média geral de rendimento baseada no edital verticalizado.">
              <p className="text-xs font-bold text-slate-500 uppercase">Média Ponderada</p>
            </Tooltip>
            <p className="text-lg font-bold">
              {subjects.length > 0 
                ? Math.round(subjects.reduce((acc, curr) => acc + calculatePercent(curr.certas || 0, curr.erradas || 0), 0) / subjects.length) 
                : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-4">
        <Info className="text-blue-500 shrink-0" size={20} />
        <p className="text-xs text-slate-300">
          Os subtópicos exibidos abaixo são sincronizados com o <strong>edital verticalizado</strong> na aba de Disciplinas. 
          O desempenho geral da matéria é calculado <strong>automaticamente</strong> com base nos lançamentos individuais.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-slate-500 font-black uppercase bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Disciplina</th>
                <th className="px-6 py-4 text-center">Certas (Geral)</th>
                <th className="px-6 py-4 text-center">Erradas (Geral)</th>
                <th className="px-6 py-4 text-center">Total Questões</th>
                <th className="px-6 py-4 text-center">Rendimento</th>
                <th className="px-6 py-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subjects.map((item) => {
                const total = calculateTotal(item.certas || 0, item.erradas || 0);
                const percent = calculatePercent(item.certas || 0, item.erradas || 0);
                const statusColor = getPerformanceColor(percent);
                const isExpanded = expandedSubject === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-800/20' : ''}`}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded bg-slate-800 ${item.color}`}>
                            <BookOpen size={14} />
                          </div>
                          <p className="font-bold text-slate-200">{item.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="w-20 bg-slate-950/50 border border-slate-800/50 rounded px-2 py-1 text-center text-emerald-400 font-mono text-sm opacity-60">
                            {item.certas || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="w-20 bg-slate-950/50 border border-slate-800/50 rounded px-2 py-1 text-center text-red-400 font-mono text-sm opacity-60">
                            {item.erradas || 0}
                          </div>
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
                        <div className="flex justify-end text-slate-500 group">
                          {isExpanded ? <ChevronUp size={20} className="text-blue-500" /> : <ChevronDown size={20} />}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Lista Expansível de Assuntos Sincronizados */}
                    {isExpanded && (
                      <tr className="bg-slate-950/40 border-l-2 border-l-blue-600 animate-in">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Target size={14} className="text-blue-500" />
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Controle de Assuntos (Sincronizado)</h4>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {(topicsMap[item.id] || []).map(topic => (
                                <div key={topic.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors">
                                  <div className="flex-1 mr-4">
                                    <p className="text-sm font-bold text-slate-300">{topic.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${topic.status === 'CONCLUIDO' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                          {topic.status === 'CONCLUIDO' ? 'BATIDO' : 'EM PAUTA'}
                                       </span>
                                       <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                                          Total: {(topic.certas || 0) + (topic.erradas || 0)} questões
                                       </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center">
                                      <label className="text-[8px] font-black text-emerald-600 uppercase mb-1">Certas</label>
                                      <input 
                                        type="number"
                                        min="0"
                                        value={topic.certas || 0}
                                        onChange={(e) => handleTopicUpdate(item.id, topic.id, 'certas', e.target.value)}
                                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-emerald-400 font-mono text-xs outline-none focus:border-emerald-500 transition-colors"
                                      />
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <label className="text-[8px] font-black text-red-600 uppercase mb-1">Erradas</label>
                                      <input 
                                        type="number"
                                        min="0"
                                        value={topic.erradas || 0}
                                        onChange={(e) => handleTopicUpdate(item.id, topic.id, 'erradas', e.target.value)}
                                        className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-red-400 font-mono text-xs outline-none focus:border-red-500 transition-colors"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {(topicsMap[item.id]?.length === 0) && (
                                <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg">
                                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Acesse a aba 'Disciplinas' para cadastrar os assuntos deste edital.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 font-medium">
                    Nenhuma disciplina operacional cadastrada no sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="space-y-2">
          <h4 className="font-bold flex items-center gap-2 uppercase tracking-widest text-xs text-slate-400">
            <Calculator size={14} className="text-blue-500" />
            Legenda de Status Operacional
          </h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">≥ 80% (Aptidão Máxima)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">60-79% (Alerta: Reforçar)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">&lt; 60% (Risco de Reprovação)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;
