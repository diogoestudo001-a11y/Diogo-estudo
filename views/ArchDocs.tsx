
import React from 'react';
import { 
  FolderTree, 
  Code2, 
  Database, 
  Layers,
  ShieldCheck
} from 'lucide-react';

const ArchDocs: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="border-b border-slate-800 pb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <ShieldCheck className="text-blue-500" />
          Blueprint: App Android Nativo
        </h2>
        <p className="text-slate-400 mt-2">Especificação de Arquitetura de Software Sênior para Concursos Policiais.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Layers className="text-blue-500" /> Camadas Clean Architecture</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-2"><strong>Domain:</strong> UseCases como `CalculateStudyCycleUseCase` e entidades puras.</li>
            <li className="flex gap-2"><strong>Data:</strong> Repositórios implementando Room (local) e Retrofit (remoto).</li>
            <li className="flex gap-2"><strong>Presentation:</strong> Jetpack Compose UI + ViewModels com StateFlow.</li>
          </ul>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="font-bold mb-4 flex items-center gap-2"><FolderTree className="text-emerald-500" /> Estrutura de Pastas (Android Studio)</h3>
          <pre className="text-[10px] text-slate-500 font-mono">
{`com.elite.study/
├── data/
│   ├── local/ (Room Dao, Entities)
│   ├── repository/
│   └── mapper/
├── domain/
│   ├── model/
│   ├── repository/
│   └── usecase/
└── ui/
    ├── dashboard/ (Compose Screens)
    ├── timer/
    ├── common/ (Components)
    └── theme/`}
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><Code2 className="text-orange-500" /> Lógica de Negócio (Kotlin)</h3>
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl font-mono text-xs">
          <p className="text-blue-400 mb-2">// Algoritmo de Planejamento Automático</p>
          <code className="text-slate-300">
{`fun generateStudyCycle(subjects: List<Subject>, availableHours: Float): Map<Subject, Float> {
    val totalWeight = subjects.sumOf { it.weight }
    return subjects.associateWith { subject ->
        val weightRatio = subject.weight.toFloat() / totalWeight
        (weightRatio * availableHours) * (1 + (subject.difficulty / 10f))
    }
}

// Room Database Entity
@Entity(tableName = "sessions")
data class StudySessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val subjectId: String,
    val durationSeconds: Long,
    val timestamp: Long = System.currentTimeMillis()
)`}
          </code>
        </div>
      </section>
    </div>
  );
};

export default ArchDocs;
