
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  BookOpen, 
  CheckCircle2, 
  Clock3,
  ChevronDown,
  Filter
} from 'lucide-react';
import { DifficultyLevel } from '../types';
import Tooltip from '../components/Tooltip';

const SubjectList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('todos');

  const subjects = [
    { id: '1', name: 'Língua Portuguesa', topics: 15, completed: 8, difficulty: DifficultyLevel.INTERMEDIATE, weight: 3, color: 'text-blue-500' },
    { id: '2', name: 'Direito Penal', topics: 22, completed: 18, difficulty: DifficultyLevel.ADVANCED, weight: 4, color: 'text-red-500' },
    { id: '3', name: 'Informática', topics: 10, completed: 2, difficulty: DifficultyLevel.BEGINNER, weight: 2, color: 'text-emerald-500' },
    { id: '4', name: 'Raciocínio Lógico', topics: 12, completed: 0, difficulty: DifficultyLevel.INTERMEDIATE, weight: 2, color: 'text-purple-500' },
    { id: '5', name: 'Criminologia', topics: 8, completed: 5, difficulty: DifficultyLevel.INTERMEDIATE, weight: 3, color: 'text-orange-500' }
  ];

  const handleAddSubject = () => {
    alert("Funcionalidade 'Nova Disciplina' será implementada na integração com o banco de dados.");
  };

  const handleMoreActions = (name: string) => {
    alert(`Opções para ${name}: Editar, Excluir ou Gerenciar Tópicos.`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Disciplinas</h2>
          <p className="text-slate-400">Gerencie seu edital verticalizado</p>
        </div>
        <button 
          onClick={handleAddSubject}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} />
          <span>Nova Disciplina</span>
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar assunto ou disciplina..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => console.log("Pesquisando:", e.target.value)}
          />
        </div>
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => alert("Filtros avançados em desenvolvimento.")}
            className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Filter size={20} />
          </button>
          {['Todos', 'Em Progresso', 'Concluídos'].map((tab) => (
             <button 
              key={tab}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.toLowerCase() ? 'bg-slate-800 text-blue-500 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-900'}`}
              onClick={() => setActiveTab(tab.toLowerCase())}
             >
               {tab}
             </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div 
            key={subject.id} 
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group cursor-pointer"
            onClick={() => alert(`Abrindo edital vertical de ${subject.name}`)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-slate-800 ${subject.color}`}>
                   <BookOpen size={24} />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleMoreActions(subject.name); }}
                  className="text-slate-600 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold mb-1">{subject.name}</h3>
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold uppercase mb-6">
                <Tooltip text="Peso atribuído para priorização no ciclo automático.">
                  <span>Peso {subject.weight}</span>
                </Tooltip>
                <span>•</span>
                <Tooltip text="Dificuldade percebida pelo usuário para esta matéria.">
                  <span className={
                    subject.difficulty === DifficultyLevel.BEGINNER ? 'text-emerald-500' :
                    subject.difficulty === DifficultyLevel.INTERMEDIATE ? 'text-blue-500' : 'text-red-500'
                  }>{subject.difficulty}</span>
                </Tooltip>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progresso</span>
                  <span className="text-slate-200 font-bold">{Math.round((subject.completed / subject.topics) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${(subject.completed / subject.topics) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                   <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center text-slate-400">
                        <CheckCircle2 size={14} className="mr-1 text-emerald-500" />
                        {subject.completed} concluídos
                      </div>
                      <div className="flex items-center text-slate-400">
                        <Clock3 size={14} className="mr-1 text-orange-500" />
                        {subject.topics - subject.completed} pendentes
                      </div>
                   </div>
                </div>
              </div>
            </div>
            
            <button className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 text-sm font-bold flex items-center justify-center space-x-2 transition-colors border-t border-slate-800 group-hover:text-blue-400">
               <span>Ver Tópicos Detalhados</span>
               <ChevronDown size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectList;
