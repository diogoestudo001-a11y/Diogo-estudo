
import React, { useState, useEffect } from 'react';
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
import { Subject } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({
    totalHours: '142h',
    accuracy: '0%',
    pendingRevisions: '12',
    overallProgress: '0%',
    cycleData: [] as Subject[],
    pieData: [] as any[]
  });

  useEffect(() => {
    const saved = localStorage.getItem('elite_study_subjects');
    if (saved) {
      const data = JSON.parse(saved) as Subject[];
      setSubjects(data);

      const totalCertas = data.reduce((acc, s) => acc + (s.certas || 0), 0);
      const totalErradas = data.reduce((acc, s) => acc + (s.erradas || 0), 0);
      const totalQuestions = totalCertas + totalErradas;
      const accuracy = totalQuestions > 0 ? Math.round((totalCertas / totalQuestions) * 100) : 0;
      
      const totalProgress = data.length > 0 
        ? Math.round(data.reduce((acc, s) => acc + (s.progresso || 0), 0) / data.length) 
        : 0;

      const pieData = data
        .filter(s => (s.certas || 0) + (s.erradas || 0) > 0)
        .map(s => ({ name: s.name, value: (s.certas || 0) + (s.erradas || 0) }))
        .slice(0, 5);

      setStats(prev => ({
        ...prev,
        accuracy: `${accuracy}%`,
        overallProgress: `${totalProgress}%`,
        cycleData: [...data].sort((a, b) => b.weight - a.weight).slice(0, 4),
        pieData: pieData.length > 0 ? pieData : [{ name: 'Sem dados', value: 1 }]
      }));
    }
  }, []);

  const hoursPerDay = [
    { day: 'Seg', hours: 4.5 },
    { day: 'Ter', hours: 5.2 },
    { day: 'Qua', hours: 3.8 },
    { day: 'Qui', hours: 6.1 },
    { day: 'Sex', hours: 4.2 },
    { day: 'Sáb', hours: 8.0 },
    { day: 'Dom', hours: 2.5 }
  ];

  const nextRevisions = [
    { id: '1', title: 'Crimes contra o patrimônio', time: '14:00', type: '24h' },
    { id: '2', title: 'Habeas Corpus', time: 'Amanhã', type: '7d' },
    { id: '3', title: 'Segurança Pública (Art. 144)', time: 'Amanhã', type: '30d' }
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Quartel General</h2>
          <p className="text-slate-400">Status operacional: Focado na Aprovação Policial</p>
        </div>
        <div 
          onClick={() => navigate('/history')}
          className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <Trophy className="text-yellow-500 group-hover:rotate-12 transition-transform" />
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Streak</p>
            <p className="text-lg font-bold">14 Dias</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Clock className="text-blue-500" />, label: 'Total Estudado', value: stats.totalHours, sub: '+12% este mês', path: '/history', tip: 'Soma total de horas dedicadas ao combate.' },
          { icon: <Target className="text-green-500" />, label: 'Taxa de Acerto', value: stats.accuracy, sub: 'Média de questões', path: '/performance', tip: 'Percentual de acerto baseado nas questões registradas.' },
          { icon: <AlertCircle className="text-orange-500" />, label: 'Revisões Pend.', value: stats.pendingRevisions, sub: 'Prioridade Alta', path: '/performance', tip: 'Tópicos que entraram no ciclo de revisão.' },
          { icon: <BookOpen className="text-purple-500" />, label: 'Progresso Edital', value: stats.overallProgress, sub: 'Média ponderada', path: '/subjects', tip: 'Percentual concluído de todo o edital verticalizado.' }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => navigate(item.path)}
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
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={20} />
              Ciclo de Estudo Prioritário
            </h3>
            <button 
              onClick={() => navigate('/subjects')}
              className="text-blue-500 text-sm font-semibold hover:underline flex items-center p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
            >
              Ver Tudo <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="space-y-6">
            {stats.cycleData.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center ${item.color}`}>
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={16} />
                      )}
                    </div>
                    <div>
                      <span className="text-lg font-semibold">{item.name}</span>
                      <span className="text-xs text-slate-500 ml-2">Peso {item.weight}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-400">{item.progresso}%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${item.progresso}%` }} 
                  />
                </div>
              </div>
            ))}
            {stats.cycleData.length === 0 && (
              <p className="text-center text-slate-500 py-10 font-bold uppercase tracking-widest text-xs">Aguardando ordens: Cadastre disciplinas.</p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursPerDay}>
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
            <h3 className="text-lg font-bold mb-4">Próximas Revisões</h3>
            <div className="space-y-4">
              {nextRevisions.map((rev) => (
                <div 
                  key={rev.id} 
                  onClick={() => navigate('/timer')}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 hover:translate-x-1 transition-all cursor-pointer border border-transparent hover:border-blue-500/20 active:scale-95"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{rev.title}</p>
                    <p className="text-xs text-slate-400">{rev.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 ml-2 ${
                    rev.type === '24h' ? 'bg-orange-500/20 text-orange-400' :
                    rev.type === '7d' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {rev.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all">
            <h3 className="text-lg font-bold mb-4">Questões por Matéria</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
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
