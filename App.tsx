
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Timer, 
  History, 
  Settings, 
  FileText, 
  TrendingUp, 
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
  <Link to={to} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:flex flex-col">
        <div className="flex items-center space-x-3 mb-10 px-2">
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
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects" element={<SubjectList />} />
          <Route path="/performance" element={<PerformanceView />} />
          <Route path="/timer" element={<StudyTimer />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/arch" element={<ArchDocs />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50">
          <Link to="/" className={`p-2 ${location.pathname === '/' ? 'text-blue-500' : 'text-slate-400'}`}><LayoutDashboard size={24} /></Link>
          <Link to="/subjects" className={`p-2 ${location.pathname === '/subjects' ? 'text-blue-500' : 'text-slate-400'}`}><BookOpen size={24} /></Link>
          <Link to="/performance" className={`p-2 ${location.pathname === '/performance' ? 'text-blue-500' : 'text-slate-400'}`}><BarChart3 size={24} /></Link>
          <Link to="/timer" className={`p-2 ${location.pathname === '/timer' ? 'text-blue-500' : 'text-slate-400'}`}><Timer size={24} /></Link>
          <Link to="/arch" className={`p-2 ${location.pathname === '/arch' ? 'text-blue-500' : 'text-slate-400'}`}><FileText size={24} /></Link>
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
