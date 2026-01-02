
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  BookOpen, 
  CheckCircle2, 
  Clock3,
  ChevronRight,
  X,
  RotateCcw,
  Trash2,
  Edit2,
  Calendar,
  ArrowLeft,
  Layout,
  Folder,
  FolderOpen,
  Library,
  Check,
  Zap,
  Target,
  Clock,
  RefreshCw,
  Loader2,
  TrendingUp,
  AlertCircle,
  BarChart3,
  TrendingDown
} from 'lucide-react';
import { DifficultyLevel, Subject, Topic, TopicStatus, StudyPlan, StudyPlanSession } from '../types';
import Tooltip from '../components/Tooltip';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const POLICE_WEIGHTS: Record<string, number> = {
  'Direito Penal': 3,
  'Direito Processual Penal': 3,
  'Legislação Especial': 3,
  'Legislação Extravagante': 3,
  'Direito Administrativo': 2,
  'Direito Constitucional': 2,
  'Português': 2,
  'RLM': 1,
  'Informática': 1,
  'Trânsito': 3,
  'Física': 1
};

const SubjectList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('todos');
  const [activeFolder, setActiveFolder] = useState<'materias' | 'cronograma' | 'desempenho' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectWeight, setNewSubjectWeight] = useState(3);
  const [newSubjectDifficulty, setNewSubjectDifficulty] = useState<DifficultyLevel>(DifficultyLevel.BEGINNER);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const [isUpdatingCycle, setIsUpdatingCycle] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('elite_study_subjects');
    if (saved) setSubjects(JSON.parse(saved));
    const savedPlans = localStorage.getItem('elite_study_plans');
    if (savedPlans) setPlans(JSON.parse(savedPlans));
  }, []);

  const openAddModal = () => {
    setEditingSubject(null);
    setNewSubjectName('');
    setNewSubjectWeight(3);
    setNewSubjectDifficulty(DifficultyLevel.BEGINNER);
    setShowModal(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubjectName(subject.name);
    setNewSubjectWeight(subject.weight);
    setNewSubjectDifficulty(subject.difficulty);
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    let updated: Subject[];
    if (editingSubject) {
      updated = subjects.map(s => s.id === editingSubject.id ? { ...s, name: newSubjectName.trim(), weight: newSubjectWeight, difficulty: newSubjectDifficulty } : s);
    } else {
      updated = [{ id: Date.now(), name: newSubjectName.trim(), weight: newSubjectWeight, difficulty: DifficultyLevel.BEGINNER, color: 'text-blue-500', totalTopics: 0, completedTopics: 0, progresso: 0, certas: 0, erradas: 0, examId: selectedPlanId || undefined }, ...subjects];
    }
    setSubjects(updated);
    localStorage.setItem('elite_study_subjects', JSON.stringify(updated));
    setShowModal(false);
  };

  const handleResetProgress = (id: number, name: string) => {
    if(confirm(`RESETE: Zerar progresso de "${name}"?`)) {
      const updated = subjects.map(s => s.id === id ? { ...s, completedTopics: 0, progresso: 0, certas: 0, erradas: 0 } : s);
      setSubjects(updated);
      localStorage.setItem('elite_study_subjects', JSON.stringify(updated));
    }
    setActiveMenu(null);
  };

  const handleDeleteSubject = (id: number, name: string) => {
    if(confirm(`EXCLUSÃO: Remover "${name}"?`)) {
      const updated = subjects.filter(s => s.id !== id);
      setSubjects(updated);
      localStorage.setItem('elite_study_subjects', JSON.stringify(updated));
    }
    setActiveMenu(null);
  };

  const toggleSubjectDone = (sessionIdx: number, subjectIdx: number) => {
    if (!selectedPlanId) return;
    const updatedPlans = plans.map(plan => {
      if (plan.examId === selectedPlanId) {
        const newSessions = [...plan.sessions];
        const targetSubjects = [...newSessions[sessionIdx].subjects];
        targetSubjects[subjectIdx] = { ...targetSubjects[subjectIdx], done: !targetSubjects[subjectIdx].done };
        newSessions[sessionIdx] = { ...newSessions[sessionIdx], subjects: targetSubjects };
        return { ...plan, sessions: newSessions };
      }
      return plan;
    });
    setPlans(updatedPlans);
    localStorage.setItem('elite_study_plans', JSON.stringify(updatedPlans));
  };

  const handleUpdateCycle = async () => {
    const currentPlan = plans.find(p => p.examId === selectedPlanId);
    if (!currentPlan || isUpdatingCycle) return;

    setIsUpdatingCycle(true);
    setUpdateMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const planSubjectsData = subjects.filter(s => s.examId === selectedPlanId);
      
      const performanceMap = planSubjectsData.reduce((acc, sub) => {
        const total = (sub.certas || 0) + (sub.erradas || 0);
        const accuracy = total > 0 ? (sub.certas / total) * 100 : 0;
        acc[sub.name] = accuracy < 60 ? 'FRACA' : (accuracy >= 80 ? 'FORTE' : 'REGULAR');
        return acc;
      }, {} as Record<string, string>);

      let pool: string[] = [];
      const subjectsInPoolNames = planSubjectsData.map(s => s.name);
      
      subjectsInPoolNames.forEach(name => {
        let count = POLICE_WEIGHTS[name] || 2;
        if (performanceMap[name] === 'FRACA') count += 1;
        for (let i = 0; i < count; i++) pool.push(name);
      });

      let workingPool = pool.sort(() => Math.random() - 0.5);
      const newSessions: StudyPlanSession[] = [];

      for (let i = 0; i < currentPlan.daysPerWeek; i++) {
        const daySubjects = [];
        const selectedForToday: string[] = [];
        
        for (let sIdx = 0; sIdx < currentPlan.subjectsPerDay; sIdx++) {
          let found = false;
          let attempt = 0;
          
          while (!found && attempt < workingPool.length) {
            const candidate = workingPool[attempt];
            if (!selectedForToday.includes(candidate)) {
              selectedForToday.push(candidate);
              workingPool.splice(attempt, 1);
              workingPool.push(candidate);
              found = true;
            } else {
              attempt++;
            }
          }

          if (!found && workingPool.length > 0) {
            const fallback = workingPool[0];
            selectedForToday.push(fallback);
            workingPool.shift();
            workingPool.push(fallback);
            found = true;
          }

          if (found) {
            daySubjects.push({
              name: selectedForToday[selectedForToday.length - 1],
              duration: 0,
              done: false,
              theoryMinutes: 0,
              questionsMinutes: 0
            });
          }
        }
        newSessions.push({ day: DAYS[i], subjects: daySubjects });
      }

      const updatedPlans = plans.map(p => p.examId === selectedPlanId ? { ...p, sessions: newSessions } : p);
      setPlans(updatedPlans);
      localStorage.setItem('elite_study_plans', JSON.stringify(updatedPlans));
      
      setUpdateMessage("Ciclo atualizado com sucesso. As matérias foram reorganizadas sem repetições no mesmo dia.");
      setTimeout(() => setUpdateMessage(null), 5000);
    } catch (error) {
      console.error(error);
      setUpdateMessage("Erro ao atualizar o ciclo. Tente novamente.");
    } finally {
      setIsUpdatingCycle(false);
    }
  };

  const handleUpdateSubjectPerformance = (subjectId: number, field: 'certas' | 'erradas', val: string) => {
    const numValue = Math.max(0, parseInt(val) || 0);
    const updated = subjects.map(s => s.id === subjectId ? { ...s, [field]: numValue } : s);
    setSubjects(updated);
    localStorage.setItem('elite_study_subjects', JSON.stringify(updated));
  };

  const calculatePercent = (certas: number, erradas: number) => {
    const total = certas + erradas;
    if (total === 0) return 0;
    return (certas / total) * 100;
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (percent >= 60) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const currentPlan = plans.find(p => p.examId === selectedPlanId);
  const planSubjects = subjects.filter(s => s.examId === selectedPlanId);
  const filteredSubjects = planSubjects.filter(s => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'em progresso') return s.progresso < 100 && s.progresso > 0;
    if (activeTab === 'concluídos') return s.progresso >= 100;
    return true;
  });

  if (!selectedPlanId) {
    return (
      <div className="space-y-6 animate-in">
        <header className="flex justify-between items-center">
          <div><h2 className="text-2xl font-bold">Base de Planos Policiais</h2><p className="text-slate-400">Seus ciclos de estudo inteligentes ativos.</p></div>
          <button onClick={() => navigate('/exams')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-bold shadow-lg"><Plus size={20} /><span>Novo Ciclo</span></button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} onClick={() => setSelectedPlanId(plan.examId)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 cursor-pointer shadow-lg group">
              <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 mb-4"><Zap size={24} /></div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{plan.examName}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase mb-4 flex items-center gap-2"><Target size={14} className="text-emerald-500" /> Meta Semanal: {plan.weeklyHoursGoal}h</p>
              <button className="w-full bg-slate-800 group-hover:bg-blue-600 py-3 rounded-xl text-sm font-bold transition-all">Acessar Missão</button>
            </div>
          ))}
          {plans.length === 0 && <div className="col-span-full py-20 text-center text-slate-500 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">Nenhum plano operacional. Comece agora em "Editais".</div>}
        </div>
      </div>
    );
  }

  if (!activeFolder) {
    return (
      <div className="space-y-8 animate-in">
        <header className="flex items-center gap-4">
          <button onClick={() => setSelectedPlanId(null)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400"><ArrowLeft size={20} /></button>
          <div><h2 className="text-2xl font-bold">{currentPlan?.examName}</h2><p className="text-slate-400">Estrutura Operacional</p></div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div onClick={() => setActiveFolder('materias')} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-blue-500/50 cursor-pointer shadow-xl group">
             <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-500 mb-6"><Library size={32} /></div>
             <h3 className="text-2xl font-bold mb-2">Matérias</h3>
             <p className="text-slate-500 text-sm mb-6">Acesse o edital verticalizado e gerencie suas disciplinas.</p>
             <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-800">{planSubjects.length} Unidades <ChevronRight size={18} /></div>
          </div>
          <div onClick={() => setActiveFolder('cronograma')} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-emerald-500/50 cursor-pointer shadow-xl group">
             <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-500 mb-6"><Calendar size={32} /></div>
             <h3 className="text-2xl font-bold mb-2">Ciclo de Estudos</h3>
             <p className="text-slate-500 text-sm mb-6">Sua ordem sequencial de combate no tempo disponível.</p>
             <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-800">Controle Inteligente <ChevronRight size={18} /></div>
          </div>
          <div onClick={() => setActiveFolder('desempenho')} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-orange-500/50 cursor-pointer shadow-xl group">
             <div className="bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center text-orange-500 mb-6"><BarChart3 size={32} /></div>
             <h3 className="text-2xl font-bold mb-2">Desempenho</h3>
             <p className="text-slate-500 text-sm mb-6">Analise seu rendimento específico nesta missão.</p>
             <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-800">Estatísticas Reais <ChevronRight size={18} /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveFolder(null)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400"><ArrowLeft size={20} /></button>
          <div><h2 className="text-xl font-bold">{activeFolder === 'materias' ? 'Matérias' : activeFolder === 'cronograma' ? 'Ciclo Inteligente' : 'Desempenho da Missão'}</h2><p className="text-xs text-slate-500 font-bold uppercase">{currentPlan?.examName}</p></div>
        </div>
        
        {activeFolder === 'cronograma' && (
          <button 
            onClick={handleUpdateCycle}
            disabled={isUpdatingCycle}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active-scale shadow-lg shadow-emerald-900/20"
          >
            {isUpdatingCycle ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            <span>Atualizar ciclo</span>
          </button>
        )}
      </header>

      {updateMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${updateMessage.includes('Erro') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {updateMessage.includes('Erro') ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-xs font-bold">{updateMessage}</p>
        </div>
      )}

      {activeFolder === 'cronograma' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in">
          {currentPlan?.sessions.map((session, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <h4 className="text-[10px] font-black text-blue-400 uppercase">{session.day}</h4>
                <div className="flex items-center gap-1 text-[9px] font-black text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                   <Clock size={10} /> {currentPlan.hoursPerDay}H DIA
                </div>
              </div>
              <div className="space-y-3 flex-1">
                {session.subjects.map((sub, sIdx) => (
                  <div key={sIdx} className="group">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSubjectDone(idx, sIdx)} className={`p-1.5 rounded-lg border transition-colors ${sub.done ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-600 hover:text-blue-400'}`}>
                        <Check size={12} strokeWidth={3} />
                      </button>
                      <span className={`text-sm font-bold truncate ${sub.done ? 'line-through text-slate-600' : 'text-slate-200'}`}>{sub.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/50 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">
                Total do dia: {currentPlan.hoursPerDay} horas
              </div>
            </div>
          ))}
        </div>
      ) : activeFolder === 'materias' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in">
           {filteredSubjects.map(sub => (
              <div key={sub.id} onClick={() => navigate(`/subjects/${sub.id}`)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 cursor-pointer shadow-xl relative">
                 <div className="flex justify-between mb-4">
                    <div className="bg-slate-800 w-10 h-10 rounded-lg flex items-center justify-center text-blue-500"><BookOpen size={20} /></div>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-2 py-1 rounded">Peso {sub.weight}</span>
                 </div>
                 <h3 className="text-lg font-bold truncate mb-4">{sub.name}</h3>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${sub.progresso}%` }} /></div>
                 <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{sub.progresso}% Concluído</p>
              </div>
           ))}
           {filteredSubjects.length === 0 && (
             <div className="col-span-full py-10 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
               Nenhuma matéria ativa encontrada para este plano policial.
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-6 animate-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500"><TrendingUp size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Média do Plano</p>
                <p className="text-xl font-bold">
                  {planSubjects.length > 0 
                    ? Math.round(planSubjects.reduce((acc, curr) => acc + calculatePercent(curr.certas || 0, curr.erradas || 0), 0) / planSubjects.length) 
                    : 0}%
                </p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><CheckCircle2 size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Total Acertos</p>
                <p className="text-xl font-bold">{planSubjects.reduce((acc, curr) => acc + (curr.certas || 0), 0)}</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500"><Zap size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Matérias Críticas</p>
                <p className="text-xl font-bold">{planSubjects.filter(s => calculatePercent(s.certas || 0, s.erradas || 0) < 60 && (s.certas + s.erradas) > 0).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="text-[10px] text-slate-500 font-black uppercase bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4">Matéria</th>
                  <th className="px-6 py-4 text-center">Certas</th>
                  <th className="px-6 py-4 text-center">Erradas</th>
                  <th className="px-6 py-4 text-center">Rendimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {planSubjects.map(sub => {
                  const percent = calculatePercent(sub.certas || 0, sub.erradas || 0);
                  const colorClass = getStatusColor(percent);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          <span className="font-bold text-sm text-slate-200">{sub.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <input 
                            type="number" 
                            value={sub.certas || 0}
                            onChange={(e) => handleUpdateSubjectPerformance(sub.id, 'certas', e.target.value)}
                            className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-emerald-400 font-mono text-sm outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <input 
                            type="number" 
                            value={sub.erradas || 0}
                            onChange={(e) => handleUpdateSubjectPerformance(sub.id, 'erradas', e.target.value)}
                            className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-red-400 font-mono text-sm outline-none focus:border-red-500 transition-colors"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <div className={`px-2 py-1 rounded text-[10px] font-black font-mono border ${colorClass}`}>
                            {Math.round(percent)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-blue-600/5 p-4 rounded-xl border border-blue-500/10 flex items-center gap-3">
             <AlertCircle className="text-blue-500 shrink-0" size={18} />
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
               Este rendimento é exclusivo para o concurso {currentPlan?.examName}. Os dados registrados aqui ajustam automaticamente a frequência das matérias no seu Ciclo de Estudos Inteligente.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectList;
