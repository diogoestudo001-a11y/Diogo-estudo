
import React from 'react';
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileCheck, 
  Clock,
  Filter,
  Download
} from 'lucide-react';
import Tooltip from '../components/Tooltip';

const HistoryView: React.FC = () => {
  const history = [
    { id: 1, subject: 'Direito Penal', topic: 'Legítima Defesa', duration: '1h 30m', questions: 20, correct: 18, date: 'Hoje, 09:30' },
    { id: 2, subject: 'Português', topic: 'Conjunções Coordenativas', duration: '45m', questions: 15, correct: 14, date: 'Ontem, 20:15' },
    { id: 3, subject: 'Dir. Administrativo', topic: 'Atos Administrativos', duration: '2h 10m', questions: 30, correct: 22, date: '12 Out, 14:00' },
    { id: 4, subject: 'Raciocínio Lógico', topic: 'Proposições Lógicas', duration: '1h 15m', questions: 25, correct: 20, date: '11 Out, 09:00' },
    { id: 5, subject: 'Criminologia', topic: 'Escolas Criminológicas', duration: '1h 00m', questions: 10, correct: 9, date: '10 Out, 18:30' }
  ];

  const handleDownloadReport = () => {
    alert("Gerando PDF operacional do histórico de estudos...");
  };

  const handleFilterDate = () => {
    alert("Seletor de data em desenvolvimento.");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Combate</h2>
          <p className="text-slate-400">Seu log de operações e desempenho em questões</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleDownloadReport}
            className="bg-slate-900 border border-slate-800 text-slate-400 p-2 rounded-lg hover:text-blue-400 hover:border-blue-500/30 transition-all active:scale-90"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={handleFilterDate}
            className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 hover:bg-slate-800 hover:border-blue-500/30 transition-all active:scale-95"
          >
            <Calendar size={18} />
            <span>Outubro 2023</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sessões', value: '42', icon: <Clock />, color: 'text-blue-500', tip: 'Número total de ciclos de estudo finalizados.' },
          { label: 'Tempo Médio', value: '1h 25m', icon: <ArrowUpRight />, color: 'text-emerald-500', tip: 'Média de duração das sessões de foco.' },
          { label: 'Acertos', value: '82%', icon: <FileCheck />, color: 'text-orange-500', tip: 'Média de desempenho global em questões.' },
          { label: 'Falhas', value: '18%', icon: <ArrowDownRight />, color: 'text-red-500', tip: 'Percentual de erros que precisam de revisão.' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-blue-500/30 transition-colors cursor-default">
            <div className="flex justify-between items-start">
              <Tooltip text={stat.tip}>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              </Tooltip>
              <div className={stat.color}>{stat.icon}</div>
            </div>
            <p className="text-xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold uppercase tracking-widest text-xs text-slate-500">Log de Estudos Recentes</h3>
          <button 
            onClick={() => alert("Filtros de disciplina em desenvolvimento.")}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <Filter size={20} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-slate-500 font-black uppercase bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Disciplina / Tópico</th>
                <th className="px-6 py-4">Duração</th>
                <th className="px-6 py-4">Questões</th>
                <th className="px-6 py-4">Desempenho</th>
                <th className="px-6 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-blue-500/5 transition-colors group cursor-pointer"
                  onClick={() => alert(`Visualizando detalhes da sessão: ${item.topic}`)}
                >
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{item.subject}</p>
                    <p className="text-xs text-slate-500">{item.topic}</p>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-400 font-mono">
                    {item.duration}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                       <span className="text-xs font-bold text-slate-300">{item.questions} total</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.correct / item.questions > 0.8 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                          style={{ width: `${(item.correct / item.questions) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold font-mono">{Math.round((item.correct / item.questions) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-medium text-slate-500">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-800/30 text-center">
          <button 
            onClick={() => alert("Buscando mais registros do servidor/local...")}
            className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
          >
            Carregar mais logs operativos
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
