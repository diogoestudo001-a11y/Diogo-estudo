
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  BookOpen,
  RotateCcw,
  X,
  Edit2,
  Check,
  Trash2,
  Power,
  Zap
} from 'lucide-react';
import { Subject, Topic, TopicStatus } from '../types';
import Tooltip from '../components/Tooltip';

const SubjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = Number(id);
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [showAddTopic, setShowAddTopic] = useState(false);
  
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState('');

  useEffect(() => {
    const savedSubjects = localStorage.getItem('elite_study_subjects');
    if (savedSubjects) {
      const list = JSON.parse(savedSubjects) as Subject[];
      const found = list.find(s => s.id === numericId);
      if (found) setSubject(found);
    }

    const savedTopics = localStorage.getItem(`elite_study_topics_${numericId}`);
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    }
  }, [numericId]);

  const handleResetProgress = () => {
    if (!subject) return;
    if (confirm(`⚠️ OPERAÇÃO CRÍTICA: Deseja zerar o progresso de "${subject.name}"?\nIsso resetará o status e o desempenho de todos os tópicos desta disciplina.`)) {
      const resetTopics = topics.map(t => ({ 
        ...t, 
        status: TopicStatus.NOT_STARTED,
        certas: 0,
        erradas: 0
      }));
      setTopics(resetTopics);
      localStorage.setItem(`elite_study_topics_${numericId}`, JSON.stringify(resetTopics));
      
      const savedSubjects = localStorage.getItem('elite_study_subjects');
      if (savedSubjects) {
        const list = JSON.parse(savedSubjects) as Subject[];
        const updatedList = list.map(s => {
          if (s.id === numericId) {
            return { ...s, completedTopics: 0, progresso: 0, certas: 0, erradas: 0 };
          }
          return s;
        });
        localStorage.setItem('elite_study_subjects', JSON.stringify(updatedList));
        const updatedSub = updatedList.find(s => s.id === numericId);
        if(updatedSub) setSubject(updatedSub);
      }
    }
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const newTopic: Topic = {
      id: Date.now(),
      disciplinaId: numericId,
      title: newTopicTitle.trim(),
      status: TopicStatus.NOT_STARTED,
      isActive: true,
      weight: 3,
      certas: 0,
      erradas: 0
    };

    const updated = [...topics, newTopic];
    setTopics(updated);
    localStorage.setItem(`elite_study_topics_${numericId}`, JSON.stringify(updated));
    setNewTopicTitle('');
    setShowAddTopic(false);
    updateSubjectProgress(updated);
  };

  const handleStartEditTopic = (e: React.MouseEvent, topic: Topic) => {
    e.stopPropagation();
    setEditingTopicId(topic.id);
    setEditingTopicTitle(topic.title);
  };

  const handleSaveTopicEdit = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (!editingTopicTitle.trim()) return;

    const updated = topics.map(t => 
      t.id === editingTopicId ? { ...t, title: editingTopicTitle.trim() } : t
    );
    setTopics(updated);
    localStorage.setItem(`elite_study_topics_${numericId}`, JSON.stringify(updated));
    setEditingTopicId(null);
    setEditingTopicTitle('');
  };

  const handleToggleActive = (e: React.MouseEvent, topicId: number) => {
    e.stopPropagation();
    const updated = topics.map(t => 
      t.id === topicId ? { ...t, isActive: !t.isActive } : t
    );
    setTopics(updated);
    localStorage.setItem(`elite_study_topics_${numericId}`, JSON.stringify(updated));
    updateSubjectProgress(updated);
  };

  const handleChangeWeight = (e: React.ChangeEvent<HTMLSelectElement>, topicId: number) => {
    const weight = parseInt(e.target.value);
    const updated = topics.map(t => 
      t.id === topicId ? { ...t, weight } : t
    );
    setTopics(updated);
    localStorage.setItem(`elite_study_topics_${numericId}`, JSON.stringify(updated));
  };

  const handleDeleteTopic = (e: React.MouseEvent, topicId: number) => {
    e.stopPropagation();
    if(confirm("Deseja excluir este tópico do edital?")) {
      const updated = topics.filter(t => t.id !== topicId);
      setTopics(updated);
      localStorage.setItem(`elite_study_topics_${numericId}`, JSON.stringify(updated));
      updateSubjectProgress(updated);
    }
  };

  const toggleStatus = (topicId: number) => {
    if (editingTopicId === topicId) return; 
    
    const updated = topics.map(t => {
      if (t.id === topicId) {
        const nextStatus = t.status === TopicStatus.COMPLETED ? TopicStatus.NOT_STARTED : TopicStatus.COMPLETED;
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTopics(updated);
    localStorage.setItem(`elite_study_topics_${numericId}`, JSON.stringify(updated));
    updateSubjectProgress(updated);
  };

  const updateSubjectProgress = (updatedTopics: Topic[]) => {
    const activeTopics = updatedTopics.filter(t => t.isActive);
    const completed = activeTopics.filter(t => t.status === TopicStatus.COMPLETED).length;
    const total = activeTopics.length;
    const progressoPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const totalCertas = updatedTopics.reduce((acc, t) => acc + (t.certas || 0), 0);
    const totalErradas = updatedTopics.reduce((acc, t) => acc + (t.erradas || 0), 0);
    
    const savedSubjects = localStorage.getItem('elite_study_subjects');
    if (savedSubjects) {
      const list = JSON.parse(savedSubjects) as Subject[];
      const updatedList = list.map(s => {
        if (s.id === numericId) {
          return { 
            ...s, 
            totalTopics: total, 
            completedTopics: completed, 
            progresso: progressoPercent,
            certas: totalCertas,
            erradas: totalErradas
          };
        }
        return s;
      });
      localStorage.setItem('elite_study_subjects', JSON.stringify(updatedList));
      const updatedSub = updatedList.find(s => s.id === numericId);
      if(updatedSub) setSubject(updatedSub);
    }
  };

  if (!subject) return <div className="p-10 text-center font-bold text-slate-500 uppercase text-xs tracking-widest">Sincronizando com o QG...</div>;

  return (
    <div className="space-y-8 pb-20 animate-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/subjects')} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center ${subject.color}`}>
              {subject.iconUrl ? (
                <img src={subject.iconUrl} alt={subject.name} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={28} />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{subject.name}</h2>
              <div className="flex items-center space-x-3 mt-1 text-sm font-bold uppercase tracking-widest text-slate-500 font-mono">
                 <span>P-{subject.weight}</span>
                 <span className="text-blue-500">{subject.difficulty}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button onClick={handleResetProgress} title="Zerar Tópicos e Desempenho" className="bg-slate-800 hover:bg-orange-500/20 text-orange-500 px-4 py-3 rounded-xl border border-orange-500/20 transition-all transform active:scale-95">
            <RotateCcw size={20} />
          </button>
          <button onClick={() => setShowAddTopic(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all transform active:scale-95">
            <Plus size={20} /> <span>Novo Tópico</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Status da Missão</h3>
          <div className="relative h-40 w-40 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
              <circle className="text-blue-500 transition-all duration-1000" strokeWidth="8" strokeDasharray={440} strokeDashoffset={440 - (440 * (subject.progresso / 100))} strokeLinecap="round" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono">{subject.progresso}%</span>
            </div>
          </div>
          <div className="space-y-4 text-xs font-bold uppercase tracking-widest">
            <div className="flex justify-between text-emerald-500"><span>Ativos Batidos:</span> <span>{subject.completedTopics}</span></div>
            <div className="flex justify-between text-orange-500"><span>Ativos Pendentes:</span> <span>{subject.totalTopics - subject.completedTopics}</span></div>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 mb-2">DESEMPENHO GLOBAL</p>
              <div className="flex justify-between text-emerald-400"><span>Acertos:</span> <span>{subject.certas}</span></div>
              <div className="flex justify-between text-red-400"><span>Erros:</span> <span>{subject.erradas}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">Matérias e Tópicos</h3>
          </div>

          {showAddTopic && (
            <form onSubmit={handleAddTopic} className="bg-slate-900 border-2 border-blue-600/30 p-4 rounded-xl flex gap-3 animate-in shadow-2xl">
               <input autoFocus type="text" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="Título do novo tópico operacional..." className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-white font-medium" />
               <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold">REGISTRAR</button>
               <button type="button" onClick={() => setShowAddTopic(false)} className="bg-slate-800 text-slate-400 px-3 py-2 rounded-lg"><X size={20} /></button>
            </form>
          )}

          <div className="space-y-2">
            {topics.map((topic) => (
              <div 
                key={topic.id} 
                className={`flex items-center p-4 rounded-xl border transition-all group ${
                  topic.status === TopicStatus.COMPLETED ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-800'
                } ${!topic.isActive ? 'grayscale opacity-40' : 'hover:border-slate-700'}`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div 
                    onClick={() => topic.isActive && toggleStatus(topic.id)}
                    className={`cursor-pointer transition-colors ${topic.status === TopicStatus.COMPLETED ? 'text-emerald-500' : 'text-slate-600 hover:text-blue-500'}`}
                  >
                    {topic.status === TopicStatus.COMPLETED ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </div>
                  
                  {editingTopicId === topic.id ? (
                    <form onSubmit={handleSaveTopicEdit} className="flex-1 flex gap-2">
                      <input 
                        autoFocus
                        type="text" 
                        value={editingTopicTitle} 
                        onChange={(e) => setEditingTopicTitle(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1 text-white outline-none focus:border-blue-500 font-bold"
                      />
                      <button type="submit" className="text-emerald-500 hover:bg-emerald-500/10 p-1 rounded transition-colors"><Check size={20} /></button>
                    </form>
                  ) : (
                    <div className="flex-1 cursor-pointer" onClick={() => topic.isActive && toggleStatus(topic.id)}>
                      <p className={`font-bold transition-all ${topic.status === TopicStatus.COMPLETED ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{topic.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${topic.status === TopicStatus.COMPLETED ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          {topic.status === TopicStatus.COMPLETED ? 'BATIDO' : 'EM PAUTA'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          <Zap size={10} className="text-blue-500" />
                          Peso: 
                          <select 
                            value={topic.weight || 3} 
                            onChange={(e) => handleChangeWeight(e, topic.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent border-none text-blue-400 outline-none cursor-pointer"
                          >
                            <option value="1">1 (Baixo)</option>
                            <option value="2">2</option>
                            <option value="3">3 (Médio)</option>
                            <option value="4">4</option>
                            <option value="5">5 (Crítico)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleToggleActive(e, topic.id)}
                    className={`p-2 transition-all rounded-lg hover:bg-slate-800 ${topic.isActive ? 'text-emerald-500' : 'text-slate-500'}`}
                    title={topic.isActive ? "Desativar do Plano" : "Ativar no Plano"}
                  >
                    <Power size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleStartEditTopic(e, topic)}
                    className="p-2 text-slate-500 hover:text-blue-400 transition-all rounded-lg hover:bg-slate-800"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteTopic(e, topic.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-all rounded-lg hover:bg-slate-800"
                    title="Remover"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {topics.length === 0 && (
              <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Nenhum tópico cadastrado nesta unidade.</p>
                <button onClick={() => setShowAddTopic(true)} className="mt-4 text-blue-500 font-bold hover:underline">Adicionar Primeiro Tópico</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetail;
