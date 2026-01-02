
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Timer, 
  History, 
  Settings, 
  FileText, 
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import Dashboard from './views/Dashboard';
import SubjectList from './views/SubjectList';
import StudyTimer from './views/StudyTimer';
import HistoryView from './views/HistoryView';
import ArchDocs from './views/ArchDocs';
import PerformanceView from './views/PerformanceView';

const SidebarItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 p-3 rounded-lg transition-all transform active:scale-95 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const SettingsPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
    <Settings size={64} className="text-slate-800 animate-spin-slow" />
    <h2 className="text-2xl font-bold">Configurações</h2>
    <p className="text-slate-500">Módulo de personalização do perfil e metas em desenvolvimento.</p>
    <Link to="/" className="bg-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">Voltar ao QG</Link>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:flex flex-col shadow-2xl z-20">
        <div className="flex items-center space-x-3 mb-10 px-2 cursor-pointer" onClick={() => window.location.hash = '/'}>
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight">ELITE <span className="text-blue-500">STUDY</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/subjects" icon={<BookOpen size={20} />} label="Disciplinas" active={location.pathname === '/subjects'} />
          <SidebarItem to="/performance" icon={<BarChart3 size={20} />} label="Desempenho" active={location.pathname === '/performance'} />
          <SidebarItem to="/timer" icon={<Timer size={20} />} label="Cronômetro" active={location.pathname === '/timer'} />
          <SidebarItem to="/history" icon={<History size={20} />} label="Histórico" active={location.pathname === '/history'} />
          <SidebarItem to="/arch" icon={<FileText size={20} />} label="Arquitetura App" active={location.pathname === '/arch'} />
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <SidebarItem to="/settings" icon={<Settings size={20} />} label="Configurações" active={location.pathname === '/settings'} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<SubjectList />} />
            <Route path="/performance" element={<PerformanceView />} />
            <Route path="/timer" element={<StudyTimer />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/arch" element={<ArchDocs />} />
            <Route path="/settings" element={<SettingsPlaceholder />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-around p-3 z-50">
          <Link to="/" className={`p-2 transition-transform active:scale-125 ${location.pathname === '/' ? 'text-blue-500' : 'text-slate-400'}`}><LayoutDashboard size={24} /></Link>
          <Link to="/subjects" className={`p-2 transition-transform active:scale-125 ${location.pathname === '/subjects' ? 'text-blue-500' : 'text-slate-400'}`}><BookOpen size={24} /></Link>
          <Link to="/performance" className={`p-2 transition-transform active:scale-125 ${location.pathname === '/performance' ? 'text-blue-500' : 'text-slate-400'}`}><BarChart3 size={24} /></Link>
          <Link to="/timer" className={`p-2 transition-transform active:scale-125 ${location.pathname === '/timer' ? 'text-blue-500' : 'text-slate-400'}`}><Timer size={24} /></Link>
          <Link to="/arch" className={`p-2 transition-transform active:scale-125 ${location.pathname === '/arch' ? 'text-blue-500' : 'text-slate-400'}`}><FileText size={24} /></Link>
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
