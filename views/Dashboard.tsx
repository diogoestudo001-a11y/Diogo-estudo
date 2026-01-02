
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Trophy, 
  Clock, 
  Target, 
  AlertCircle,
  ChevronRight,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import Tooltip from '../components/Tooltip';

const MOCK_DATA = {
  hoursPerDay: [
    { day: 'Seg', hours: 4.5 },
    { day: 'Ter', hours: 5.2 },
    { day: 'Qua', hours: 3.8 },
    { day: 'Qui', hours: 6.1 },
    { day: 'Sex', hours: 4.2 },
    { day: 'Sáb', hours: 8.0 },
    { day: 'Dom', hours: 2.5 }
  ],
  subjectPerformance: [
    { name: 'Dir. Penal', value: 85 },
    { name: 'Dir. Const', value: 72 },
    { name: 'Informática', value: 64 },
    { name: 'Português', value: 91 }
  ],
  nextRevisions: [
    { id: '1', title: 'Crimes contra o patrimônio', time: '14:00', type: '24h' },
    { id: '2', title: 'Habeas Corpus', time: 'Amanhã', type: '7d' },
    { id: '3', title: 'Segurança Pública (Art. 144)', time: 'Amanhã', type: '30d' }
  ],
  studyCycle: [
    { name: 'Português', weight: 3, progress: 100 },
    { name: 'Dir. Penal', weight: 4, progress: 45 },
    { name: 'Informática', weight: 2, progress: 10 },
    { name: 'Raciocínio Lógico', weight: 2, progress: 0 }
  ]
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleStatClick = (path: string) => {
    navigate(path);
  };

  const handleRevisionClick = (title: string) => {
    alert(`Iniciando revisão operacional: ${title}`);
    navigate('/timer');
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Quartel General</h2>
          <p className="text-slate-400">Status operacional: Focado na PC-SP / PRF</p>
        </div>
        <div 
          onClick={() => alert("Histórico de medalhas em desenvolvimento!")}
          className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-slate-800 transition-colors active:scale-95"
        >
          <Trophy className="text-yellow-500" />
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Streak</p>
            <p className="text-lg font-bold">14 Dias</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Clock className="text-blue-500" />, label: 'Total Estudado', value: '142h', sub: '+12% este mês', path: '/history', tip: 'Soma total de horas dedicadas ao combate.' },
          { icon: <Target className="text-green-500" />, label: 'Taxa de Acerto', value: '78.5%', sub: 'Média de 450 questões', path: '/performance', tip: 'Percentual de acerto baseado nas questões registradas.' },
          { icon: <AlertCircle className="text-orange-500" />, label: 'Revisões Pend.', value: '12', sub: 'Prioridade Alta', path: '/performance', tip: 'Tópicos que entraram no ciclo de revisão (24h/7d/30d).' },
          { icon: <BookOpen className="text-purple-500" />, label: 'Progresso Edital', value: '42%', sub: '78 de 185 tópicos', path: '/subjects', tip: 'Percentual concluído de todo o edital verticalizado.' }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => handleStatClick(item.path)}
            className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer active:scale-95 group relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-blue-500/10 transition-colors">{item.icon}</div>
                <Tooltip text={item.tip}>
                  <span className="text-slate-400 text-sm font-medium">{item.label}</span>
                </Tooltip>
              </div>
            </div>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div 
          onClick={() => navigate('/subjects')}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={20} />
              <Tooltip text="Ordem de estudo baseada no peso e dificuldade de cada disciplina.">
                Ciclo de Estudo Atual
              </Tooltip>
            </h3>
            <button className="text-blue-500 text-sm font-semibold hover:underline flex items-center">
              Ajustar Ciclo <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="space-y-6">
            {MOCK_DATA.studyCycle.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-lg font-semibold">{item.name}</span>
                    <span className="text-xs text-slate-500 ml-2">Peso {item.weight}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-400">{item.progress}%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${item.progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_DATA.hoursPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  cursor={{ fill: '#334155' }}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
              <Tooltip text="Revisões automáticas geradas após concluir um tópico.">
                Próximas Revisões
              </Tooltip>
            </h3>
            <div className="space-y-4">
              {MOCK_DATA.nextRevisions.map((rev) => (
                <div 
                  key={rev.id} 
                  onClick={(e) => { e.stopPropagation(); handleRevisionClick(rev.title); }}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 hover:translate-x-1 transition-all cursor-pointer border border-transparent hover:border-blue-500/20"
                >
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{rev.title}</p>
                    <p className="text-xs text-slate-400">{rev.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    rev.type === '24h' ? 'bg-orange-500/20 text-orange-400' :
                    rev.type === '7d' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {rev.type}
                  </span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/performance')}
              className="w-full mt-4 py-2 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
            >
              VER CALENDÁRIO COMPLETO
            </button>
          </div>

          <div 
            onClick={() => navigate('/performance')}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 cursor-pointer transition-all"
          >
            <h3 className="text-lg font-bold mb-4">
              <Tooltip text="Distribuição de questões resolvidas por cada disciplina.">
                Questões por Matéria
              </Tooltip>
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_DATA.subjectPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {MOCK_DATA.subjectPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
