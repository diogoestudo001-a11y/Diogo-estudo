
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  ChevronRight, 
  PlusCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Zap,
  RefreshCw,
  Globe,
  ShieldAlert,
  Target,
  BarChart3,
  Dna,
  ArrowLeft,
  Settings2,
  ListOrdered,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  Loader2,
  TrendingDown
} from 'lucide-react';
import { Exam, StudyPlan, Subject, DifficultyLevel, TopicStatus, Topic, StudyPlanSession, CycleMode } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const EXAMS: Exam[] = [
  { id: 'prf', name: 'Polícia Rodoviária Federal (PRF)', institution: 'Cebraspe', subjects: ['Português', 'RLM', 'Informática', 'Física', 'Ética', 'Geopolítica', 'Trânsito', 'Direito Administrativo', 'Direito Constitucional', 'Direito Penal', 'Direito Processual Penal', 'Legislação Especial', 'Direitos Humanos'] },
  { id: 'pcgo', name: 'Polícia Civil de Goiás (PC-GO)', institution: 'Instituto AOCP', subjects: ['Português', 'RLM', 'Direito Administrativo', 'Direito Constitucional', 'Direito Penal', 'Direito Processual Penal', 'Legislação Especial', 'Criminalística', 'Medicina Legal'] },
  { id: 'pmgo', name: 'Polícia Militar de Goiás (PM-GO)', institution: 'Instituto AOCP', subjects: ['Português', 'Realidade de Goiás', 'RLM', 'Direito Constitucional', 'Direito Administrativo', 'Direito Penal', 'Direito Processual Penal', 'Direito Penal Militar', 'Direito Processual Penal Militar'] },
  { id: 'pmdf', name: 'Polícia Militar do Distrito Federal (PM-DF)', institution: 'Instituto AOCP', subjects: ['Português', 'Inglês', 'RLM', 'Atualidades', 'Direito Constitucional', 'Direito Administrativo', 'Direito Penal', 'Direito Processual Penal', 'Legislação Extravagante'] },
  { id: 'cbmgo', name: 'Corpo de Bombeiros Militar de Goiás (CBM-GO)', institution: 'Instituto AOCP', subjects: ['Português', 'RLM', 'Noções de Direito', 'Física', 'Química', 'Biologia', 'Direito Administrativo'] }
];

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

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const BLOCK_DURATION_MINUTES = 50;

type ModalStep = 'config' | 'cycleConfig' | 'manualCycle' | 'preview';

const ExamsView: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('config');
  
  const [totalWeeklyHours, setTotalWeeklyHours] = useState(20);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [weeklyQuestionsGoal, setWeeklyQuestionsGoal] = useState(100);
  const [subjectsPerDay, setSubjectsPerDay] = useState(2);
  const [cycleMode, setCycleMode] = useState<CycleMode>(CycleMode.AUTO);
  const [manualSequence, setManualSequence] = useState<string[]>([]);
  
  const [previewPlan, setPreviewPlan] = useState<StudyPlan | null>(null);
  const [existingPlans, setExistingPlans] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syllabusData, setSyllabusData] = useState<Record<string, { title: string, weight: number }[]> | null>(null);
  
  const [isUpdatingAdaptive, setIsUpdatingAdaptive] = useState(false);
  const [adaptiveSuccessMessage, setAdaptiveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedPlans = localStorage.getItem('elite_study_plans');
    if (savedPlans) setExistingPlans(JSON.parse(savedPlans));
  }, []);

  const syncSyllabusFromSource = async (exam: Exam): Promise<Record<string, { title: string, weight: number }[]>> => {
    if (!process.env.API_KEY) {
      throw new Error("Conexão com a base de dados não configurada corretamente (API Key ausente).");
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Você é um especialista em concursos policiais. Sua tarefa é fornecer o conteúdo programático verticalizado do concurso "${exam.name}" (Banca: ${exam.institution}) consultando exclusivamente os padrões do site pciconcursos.com.br. 
      Para as seguintes matérias: ${exam.subjects.join(', ')}.
      Retorne para cada matéria uma lista de 5 a 8 tópicos principais que costumam cair em editais policiais.
      O formato deve ser JSON estrito: { "Nome da Materia": [{ "title": "Nome do Topico", "weight": 3 }, ...] }`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: exam.subjects.reduce((acc, sub) => {
              acc[sub] = {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    weight: { type: Type.NUMBER }
                  },
                  required: ['title', 'weight']
                }
              };
              return acc;
            }, {} as any)
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Falha na sincronização de edital:", error);
      throw new Error("Erro na comunicação com a base de dados do edital. Tente novamente.");
    }
  };

  const distributeSubjectsToSessions = (
    daysToFill: number, 
    subsPerDay: number, 
    pool: string[], 
    performanceMap: Record<string, { classification: string }> = {}
  ): StudyPlanSession[] => {
    const sessions: StudyPlanSession[] = [];
    let lastDaySubjectNames: string[] = [];
    let workingPool = [...pool];

    for (let i = 0; i < daysToFill; i++) {
      const daySubjects = [];
      const selectedForToday: string[] = [];
      
      for (let sIdx = 0; sIdx < subsPerDay; sIdx++) {
        let found = false;
        let attempt = 0;
        
        while (!found && attempt < workingPool.length) {
          const candidate = workingPool[attempt];
          const classification = performanceMap[candidate]?.classification || 'REGULAR';
          const isWeak = classification === 'FRACA';
          
          const inToday = selectedForToday.includes(candidate);
          const inYesterday = lastDaySubjectNames.includes(candidate);
          
          if (!inToday) {
            if (!inYesterday || isWeak) {
              selectedForToday.push(candidate);
              workingPool.splice(attempt, 1);
              workingPool.push(candidate);
              found = true;
            } else {
              attempt++;
            }
          } else {
            attempt++;
          }
        }

        if (!found) {
          attempt = 0;
          while (!found && attempt < workingPool.length) {
            const candidate = workingPool[attempt];
            const inToday = selectedForToday.includes(candidate);
            
            if (!inToday) {
              selectedForToday.push(candidate);
              workingPool.splice(attempt, 1);
              workingPool.push(candidate);
              found = true;
            } else {
              attempt++;
            }
          }
        }

        if (found) {
          daySubjects.push({
            name: selectedForToday[selectedForToday.length - 1],
            duration: 0,
            theoryMinutes: 0,
            questionsMinutes: 0
          });
        }
      }
      
      lastDaySubjectNames = [...selectedForToday];
      sessions.push({ day: DAYS[i], subjects: daySubjects });
    }
    return sessions;
  };

  const generatePlanPreview = async () => {
    if (!selectedExam || isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);

    // Pequeno delay artificial para garantir que o estado de loading seja perceptível e o clique seja bloqueado
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const hoursPerDay = totalWeeklyHours / daysPerWeek;
      const availableBlocks = Math.floor((hoursPerDay * 60) / BLOCK_DURATION_MINUTES);
      
      if (subjectsPerDay > availableBlocks) {
        throw new Error(`ERRO DE CAPACIDADE: ${hoursPerDay.toFixed(1)}h por dia permitem no máximo ${availableBlocks} matérias organizadas. Diminua a quantidade de matérias por dia.`);
      }

      if (cycleMode === CycleMode.MANUAL && manualSequence.length === 0) {
        throw new Error("Defina pelo menos uma matéria para o ciclo manual.");
      }

      // Sincronização com AI
      const syllabus = await syncSyllabusFromSource(selectedExam);
      setSyllabusData(syllabus);
      
      let shuffledPool: string[] = [];
      if (cycleMode === CycleMode.AUTO) {
        const pool: string[] = [];
        selectedExam.subjects.forEach(subName => {
          let count = POLICE_WEIGHTS[subName] || 2;
          for (let i = 0; i < count; i++) pool.push(subName);
        });
        shuffledPool = pool.sort(() => Math.random() - 0.5);
      } else {
        shuffledPool = [...manualSequence];
      }

      const sessions = distributeSubjectsToSessions(daysPerWeek, subjectsPerDay, shuffledPool);

      const tempPlan: StudyPlan = {
        id: Date.now(),
        examId: selectedExam.id,
        examName: selectedExam.name,
        hoursPerDay: Math.round(hoursPerDay * 10) / 10,
        daysPerWeek,
        weeklyHoursGoal: totalWeeklyHours,
        weeklyQuestionsGoal,
        subjectsPerDay,
        cycleMode,
        manualSequence: cycleMode === CycleMode.MANUAL ? manualSequence : undefined,
        sessions,
        createdAt: new Date().toISOString()
      };

      setPreviewPlan(tempPlan);
      setModalStep('preview');
    } catch (err: any) {
      setSyncError(err.message || "Não foi possível gerar o ciclo. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateAdaptiveCycle = async () => {
    if (!activePlan || isUpdatingAdaptive) return;
    setIsUpdatingAdaptive(true);

    try {
      const savedSubjectsRaw = localStorage.getItem('elite_study_subjects');
      if (!savedSubjectsRaw) return;
      const subjects: Subject[] = JSON.parse(savedSubjectsRaw);
      
      const planSubjects = subjects.filter(s => s.examId === activePlan.examId);
      
      const performanceMap = planSubjects.reduce((acc, sub) => {
        const total = sub.certas + sub.erradas;
        const accuracy = total > 0 ? (sub.certas / total) * 100 : 0;
        
        let classification: 'FRACA' | 'REGULAR' | 'FORTE' = 'REGULAR';
        if (accuracy < 60) classification = 'FRACA';
        else if (accuracy >= 80) classification = 'FORTE';
        
        acc[sub.name] = { classification, accuracy };
        return acc;
      }, {} as Record<string, { classification: string, accuracy: number }>);

      let pool: string[] = [];
      const subjectsInPlan = activePlan.cycleMode === CycleMode.MANUAL && activePlan.manualSequence 
        ? activePlan.manualSequence 
        : activePlan.sessions.flatMap(s => s.subjects.map(sub => sub.name)).filter((v, i, a) => a.indexOf(v) === i);

      subjectsInPlan.forEach(subName => {
        let baseCount = POLICE_WEIGHTS[subName] || 2;
        const perf = performanceMap[subName];
        if (perf && perf.classification === 'FRACA') {
          baseCount += 1;
        }
        for (let i = 0; i < baseCount; i++) pool.push(subName);
      });

      const shuffledPool = pool.sort(() => Math.random() - 0.5);

      const newSessions = distributeSubjectsToSessions(
        activePlan.daysPerWeek, 
        activePlan.subjectsPerDay, 
        shuffledPool, 
        performanceMap
      );

      const updatedPlan: StudyPlan = {
        ...activePlan,
        sessions: newSessions
      };

      const updatedPlans = existingPlans.map(p => p.id === activePlan.id ? updatedPlan : p);
      setExistingPlans(updatedPlans);
      localStorage.setItem('elite_study_plans', JSON.stringify(updatedPlans));
      setActivePlan(updatedPlan);
      
      setAdaptiveSuccessMessage("Ciclo ajustado. Matérias críticas priorizadas sem repetição no mesmo dia.");
      setTimeout(() => setAdaptiveSuccessMessage(null), 5000);

    } catch (error) {
      console.error("Erro ao adaptar ciclo:", error);
    } finally {
      setIsUpdatingAdaptive(false);
    }
  };

  const confirmPlan = async () => {
    if (!previewPlan || !selectedExam || !syllabusData || isConfirming) return;
    
    setIsConfirming(true);
    setSyncError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const savedSubjectsRaw = localStorage.getItem('elite_study_subjects');
      let subjectsList: Subject[] = savedSubjectsRaw ? JSON.parse(savedSubjectsRaw) : [];
      
      selectedExam.subjects.forEach(subName => {
        let subjectId: number;
        const existingSub = subjectsList.find(s => s.name === subName && s.examId === selectedExam.id);
        
        if (!existingSub) {
          subjectId = Date.now() + Math.random();
          subjectsList.push({
            id: subjectId,
            name: subName,
            weight: POLICE_WEIGHTS[subName] || 2,
            difficulty: DifficultyLevel.BEGINNER,
            color: 'text-blue-500',
            totalTopics: syllabusData[subName]?.length || 0,
            completedTopics: 0,
            progresso: 0,
            certas: 0,
            erradas: 0,
            examId: selectedExam.id
          });
        } else {
          subjectId = existingSub.id;
        }

        const topicsKey = `elite_study_topics_${subjectId}`;
        const existingTopicsRaw = localStorage.getItem(topicsKey);
        let existingTopics: Topic[] = existingTopicsRaw ? JSON.parse(existingTopicsRaw) : [];
        
        const importedTopics = syllabusData[subName] || [];
        importedTopics.forEach((item, idx) => {
          const alreadyExists = existingTopics.some(t => t.title.toLowerCase() === item.title.toLowerCase());
          if (!alreadyExists) {
            existingTopics.push({
              id: Date.now() + idx + Math.random(),
              disciplinaId: subjectId,
              title: item.title,
              status: TopicStatus.NOT_STARTED,
              isActive: true,
              weight: item.weight,
              certas: 0,
              erradas: 0
            });
          }
        });
        localStorage.setItem(topicsKey, JSON.stringify(existingTopics));
      });

      localStorage.setItem('elite_study_subjects', JSON.stringify(subjectsList));
      const updatedPlans = [previewPlan, ...existingPlans.filter(p => p.examId !== selectedExam.id)];
      setExistingPlans(updatedPlans);
      localStorage.setItem('elite_study_plans', JSON.stringify(updatedPlans));
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setActivePlan(previewPlan);
        setSelectedExam(null);
        setShowPlanModal(false);
        setPreviewPlan(null);
        setModalStep('config');
        setSyllabusData(null);
        setIsConfirming(false);
        setShowSuccess(false);
      }, 1200);

    } catch (err) {
      setSyncError("Erro ao salvar o ciclo. Tente novamente.");
      setIsConfirming(false);
    }
  };

  const deletePlan = (id: number) => {
    if (confirm("REMOVER MISSÃO? O progresso individual das matérias será mantido, mas o ciclo será excluído.")) {
      const updated = existingPlans.filter(p => p.id !== id);
      setExistingPlans(updated);
      localStorage.setItem('elite_study_plans', JSON.stringify(updated));
      if (activePlan?.id === id) setActivePlan(null);
    }
  };

  const toggleManualSubject = (name: string) => {
    if (manualSequence.includes(name)) {
      setManualSequence(prev => prev.filter(s => s !== name));
    } else {
      setManualSequence(prev => [...prev, name]);
    }
  };

  const moveManualSubject = (index: number, direction: 'up' | 'down') => {
    const newSeq = [...manualSequence];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSeq.length) return;
    [newSeq[index], newSeq[targetIdx]] = [newSeq[targetIdx], newSeq[index]];
    setManualSequence(newSeq);
  };

  return (
    <div className="space-y-8 animate-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Dna className="text-blue-500" />
            Editais Policiais Inteligentes
          </h2>
          <p className="text-slate-400">Ciclos adaptativos com importação PCI Concursos.</p>
        </div>
        <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
           <Zap size={12} /> Modelo: Ciclo de Estudos
        </div>
      </header>

      {activePlan ? (
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <ShieldAlert size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Plano de Elite Ativo</span>
              </div>
              <h3 className="text-2xl font-bold">{activePlan.examName}</h3>
              <p className="text-slate-400 text-sm">Total Semanal: {activePlan.weeklyHoursGoal}h • Meta {activePlan.weeklyQuestionsGoal} Questões • {activePlan.hoursPerDay}h/Dia</p>
            </div>
            <div className="flex flex-wrap gap-2">
               <button 
                 onClick={handleUpdateAdaptiveCycle} 
                 disabled={isUpdatingAdaptive}
                 className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 active-scale shadow-lg shadow-emerald-900/20"
               >
                 {isUpdatingAdaptive ? <Loader2 className="animate-spin" size={18} /> : <TrendingDown size={18} />}
                 <span>Atualizar Ciclo (Desempenho)</span>
               </button>
               <button onClick={() => setActivePlan(null)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-all active-scale">Ver Outros</button>
               <button onClick={() => deletePlan(activePlan.id)} className="bg-red-500/10 text-red-500 p-2 rounded-lg active-scale"><Trash2 size={20} /></button>
            </div>
          </div>

          {adaptiveSuccessMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
              <p className="text-xs text-emerald-200 font-bold">{adaptiveSuccessMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {activePlan.sessions.map((s, idx) => (
                <div key={idx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 transition-all hover:border-slate-700">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-1">
                    <h4 className="text-xs font-black text-blue-400">{s.day}</h4>
                    <span className="text-[9px] font-bold text-slate-500">{activePlan.hoursPerDay}h</span>
                  </div>
                  <div className="space-y-2">
                    {s.subjects.map((sub, sIdx) => (
                      <div key={sIdx} className="text-xs text-slate-400 truncate flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        <span>{sub.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {EXAMS.map(exam => (
            <div key={exam.id} onClick={() => { setSelectedExam(exam); setManualSequence([]); setModalStep('config'); }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl flex flex-col">
              <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform"><Zap size={24} /></div>
              <h3 className="text-xl font-bold mb-1 leading-tight">{exam.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{exam.institution}</p>
              <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                 <span className="text-xs text-slate-400 font-bold uppercase">{exam.subjects.length} Matérias</span>
                 <ChevronRight size={20} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedExam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
            
            {showSuccess && (
              <div className="absolute inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in">
                <div className="bg-emerald-500 text-white p-4 rounded-full mb-4 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white">Ciclo de estudos criado com sucesso</h3>
                <p className="text-slate-400 mt-2">Total: {totalWeeklyHours}h • {Math.round((totalWeeklyHours/daysPerWeek)*10)/10}h por dia.</p>
              </div>
            )}

            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 {modalStep !== 'config' && (
                   <button 
                    disabled={isSyncing || isConfirming}
                    onClick={() => {
                      if (modalStep === 'cycleConfig') setModalStep('config');
                      else if (modalStep === 'manualCycle') setModalStep('cycleConfig');
                      else if (modalStep === 'preview') setModalStep(cycleMode === CycleMode.MANUAL ? 'manualCycle' : 'cycleConfig');
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-50"
                   >
                     <ArrowLeft size={20} />
                   </button>
                 )}
                 <h3 className="text-xl font-bold truncate max-w-[400px]">{selectedExam.name}</h3>
               </div>
               <button disabled={isSyncing || isConfirming} onClick={() => { setSelectedExam(null); setModalStep('config'); }} className="text-slate-500 disabled:opacity-50"><X size={28} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {modalStep === 'config' ? (
                <div className="space-y-6 animate-in">
                   <h4 className="text-lg font-bold flex items-center gap-2"><Settings2 className="text-blue-500" /> Configuração Geral</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Clock size={14} /> Horas Totais Semanais</label>
                         <input type="number" min="1" value={totalWeeklyHours} onChange={e => setTotalWeeklyHours(parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><CalendarIcon size={14} /> Dias de Estudo</label>
                         <input type="number" min="1" max="7" value={daysPerWeek} onChange={e => setDaysPerWeek(parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Target size={14} /> Meta de Questões (Semanal)</label>
                      <input type="number" min="10" value={weeklyQuestionsGoal} onChange={e => setWeeklyQuestionsGoal(parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                   </div>
                   <div className="bg-blue-600/5 p-4 rounded-xl border border-blue-500/10">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Cálculo Automático:</p>
                      <p className="text-sm font-bold text-slate-200">{Math.round((totalWeeklyHours/daysPerWeek)*10)/10} horas reais por dia estudado.</p>
                   </div>
                   <button onClick={() => setModalStep('cycleConfig')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale">
                      PRÓXIMO: CONFIGURAR CICLO <ChevronRight size={20} />
                   </button>
                </div>
              ) : modalStep === 'cycleConfig' ? (
                <div className="space-y-6 animate-in">
                  <h4 className="text-lg font-bold flex items-center gap-2"><Target className="text-blue-500" /> Distribuição de Matérias</h4>
                  
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Diferentes matérias por dia</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <button 
                          key={num}
                          onClick={() => setSubjectsPerDay(num)}
                          className={`py-3 rounded-xl border font-bold transition-all ${subjectsPerDay === num ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                        >
                          {num} {num === 1 ? 'Matéria' : 'Matérias'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo de Ciclo</p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setCycleMode(CycleMode.AUTO)}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${cycleMode === CycleMode.AUTO ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                      >
                        <div className="text-left">
                          <p className={`font-bold ${cycleMode === CycleMode.AUTO ? 'text-blue-400' : 'text-white'}`}>Automático (Inteligente)</p>
                          <p className="text-[10px] text-slate-500">O sistema organiza as matérias baseado em pesos.</p>
                        </div>
                        {cycleMode === CycleMode.AUTO && <CheckCircle2 size={20} className="text-blue-500" />}
                      </button>

                      <button 
                        onClick={() => setCycleMode(CycleMode.MANUAL)}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${cycleMode === CycleMode.MANUAL ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                      >
                        <div className="text-left">
                          <p className={`font-bold ${cycleMode === CycleMode.MANUAL ? 'text-blue-400' : 'text-white'}`}>Criar Meu Ciclo (Personalizado)</p>
                          <p className="text-[10px] text-slate-500">Você escolhe a sequência exata de estudo.</p>
                        </div>
                        {cycleMode === CycleMode.MANUAL && <CheckCircle2 size={20} className="text-blue-500" />}
                      </button>
                    </div>
                  </div>

                  {syncError && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 animate-in">
                      <AlertCircle className="text-red-500 shrink-0" size={20} />
                      <p className="text-xs text-red-400 font-bold">{syncError}</p>
                    </div>
                  )}

                  <button 
                    disabled={isSyncing}
                    onClick={() => {
                      if (cycleMode === CycleMode.MANUAL) setModalStep('manualCycle');
                      else generatePlanPreview();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale shadow-lg shadow-blue-900/20"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Gerando ciclo de estudos...
                      </>
                    ) : (
                      <>
                        {cycleMode === CycleMode.MANUAL ? 'PRÓXIMO: SEQUÊNCIA' : 'GERAR CICLO DE ESTUDOS'} <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              ) : modalStep === 'manualCycle' ? (
                <div className="space-y-6 animate-in">
                  <h4 className="text-lg font-bold flex items-center gap-2"><ListOrdered className="text-blue-500" /> Criar Meu Ciclo</h4>
                  <p className="text-xs text-slate-400">Monte a sequência que será distribuída no seu tempo.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Matérias Disponíveis</p>
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {selectedExam.subjects.map(sub => (
                          <button 
                            key={sub}
                            onClick={() => toggleManualSubject(sub)}
                            className={`w-full p-3 rounded-lg border text-sm text-left transition-all flex items-center justify-between ${manualSequence.includes(sub) ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                          >
                            <span>{sub}</span>
                            {manualSequence.includes(sub) ? <Minus size={14} /> : <Plus size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sua Sequência ({manualSequence.length})</p>
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {manualSequence.map((sub, idx) => (
                          <div key={idx} className="bg-slate-800 border border-slate-700 p-2 rounded-lg flex items-center justify-between gap-2">
                            <span className="text-xs font-bold truncate flex-1">{idx + 1}. {sub}</span>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => moveManualSubject(idx, 'up')} className="p-1 hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30" disabled={idx === 0}><ChevronUp size={14} /></button>
                              <button onClick={() => moveManualSubject(idx, 'down')} className="p-1 hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30" disabled={idx === manualSequence.length - 1}><ChevronDown size={14} /></button>
                              <button onClick={() => toggleManualSubject(sub)} className="p-1 hover:bg-red-500/20 rounded text-red-500"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                        {manualSequence.length === 0 && <p className="text-center py-10 text-[10px] text-slate-600 uppercase font-black">Nenhuma matéria selecionada</p>}
                      </div>
                    </div>
                  </div>

                  {syncError && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 animate-in">
                      <AlertCircle className="text-red-500 shrink-0" size={20} />
                      <p className="text-xs text-red-400 font-bold">{syncError}</p>
                    </div>
                  )}

                  <button 
                    onClick={generatePlanPreview}
                    disabled={manualSequence.length === 0 || isSyncing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale shadow-lg shadow-blue-900/20"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Gerando ciclo de estudos...
                      </>
                    ) : (
                      <>CRIAR MEU CICLO <ChevronRight size={20} /></>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in">
                   <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold">Resumo do Plano Gerado</h4>
                      <div className="bg-blue-500/10 px-2 py-1 rounded text-[10px] font-black text-blue-500 uppercase tracking-widest">{cycleMode}</div>
                   </div>
                   {isSyncing ? (
                     <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <Loader2 className="text-blue-500 animate-spin" size={48} />
                        <p className="text-sm font-bold text-slate-400">FINALIZANDO ESTRUTURA...</p>
                     </div>
                   ) : (
                     <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                              <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Total Semanal</p>
                              <p className="text-2xl font-bold text-blue-500">{previewPlan?.weeklyHoursGoal}h</p>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                              <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Fixo por Dia</p>
                              <p className="text-2xl font-bold text-emerald-500">{previewPlan?.hoursPerDay}h</p>
                            </div>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Organização de Missões por Dia</h5>
                            <div className="space-y-2">
                              {Array.from(new Set(previewPlan?.sessions.flatMap(s => s.subjects.map(sub => sub.name)))).map(name => {
                                const count = previewPlan?.sessions.flatMap(s => s.subjects).filter(s => s.name === name).length;
                                return (
                                  <div key={name} className="flex justify-between items-center text-sm">
                                      <span className="text-slate-300 font-medium">{name}</span>
                                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-400">{count} sessões</span>
                                  </div>
                                );
                              })}
                            </div>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                           <ShieldAlert size={20} className="text-emerald-500" />
                           <p className="text-[10px] text-emerald-200/70 font-bold uppercase tracking-widest leading-relaxed">
                              Ciclo estável e validado: Foco total no cumprimento do tempo diário.
                           </p>
                        </div>
                        <button 
                          onClick={confirmPlan} 
                          disabled={isConfirming}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all shadow-xl active-scale flex items-center justify-center gap-2"
                        >
                          {isConfirming ? (
                            <>
                              <Loader2 className="animate-spin" size={20} />
                              CONFIRMANDO OPERAÇÃO...
                            </>
                          ) : (
                            'CONFIRMAR E IMPORTAR EDITAL'
                          )}
                        </button>
                     </>
                   )}
                   {syncError && (
                     <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 mt-4 animate-in">
                       <AlertCircle className="text-red-500 shrink-0" size={20} />
                       <p className="text-xs text-red-400 font-bold">{syncError}</p>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsView;
