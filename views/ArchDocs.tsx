
import React from 'react';
import { 
  FolderTree, 
  Code2, 
  Database, 
  Layers,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import Tooltip from '../components/Tooltip';

const ArchDocs: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-blue-500" />
            Blueprint: App Android Nativo
          </h2>
          <p className="text-slate-400 mt-2">Especificação de Arquitetura de Software Sênior para Concursos Policiais.</p>
        </div>
        <button 
          onClick={() => window.open('https://developer.android.com/jetpack/compose', '_blank')}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20"
        >
          Docs Android <ExternalLink size={14} />
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/30 transition-all cursor-default">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Layers className="text-blue-500" /> 
            <Tooltip text="Divisão de responsabilidades para garantir testabilidade e manutenção.">
              Camadas Clean Architecture
            </Tooltip>
          </h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-2 p-2 hover:bg-slate-800 rounded transition-colors"><strong>Domain:</strong> UseCases como `CalculateStudyCycleUseCase` e entidades puras.</li>
            <li className="flex gap-2 p-2 hover:bg-slate-800 rounded transition-colors"><strong>Data:</strong> Repositórios implementando Room (local) e Retrofit (remoto).</li>
            <li className="flex gap-2 p-2 hover:bg-slate-800 rounded transition-colors"><strong>Presentation:</strong> Jetpack Compose UI + ViewModels com StateFlow.</li>
          </ul>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FolderTree className="text-emerald-500" /> 
            <Tooltip text="Organização de pacotes sugerida para o projeto no Android Studio.">
              Estrutura de Pastas
            </Tooltip>
          </h3>
          <pre className="text-[10px] text-slate-500 font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 group-hover:border-emerald-500/20 transition-all overflow-x-auto">
{`com.elite.study/
├── data/
│   ├── local/ (Room Dao, Entities)
│   ├── repository/ (DisciplinaRepository)
│   └── mapper/
├── domain/
│   ├── model/ (Subject, Topic)
│   ├── repository/
│   └── usecase/
└── ui/
    ├── dashboard/ (Compose Screens)
    ├── subjects/
    ├── common/ (Components)
    └── theme/`}
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Code2 className="text-orange-500" /> 
          <Tooltip text="Exemplos reais de como o sistema automatiza o planejamento policial.">
            Fluxo Arquitetural: Implementação Nativa Kotlin
          </Tooltip>
        </h3>
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl font-mono text-[11px] hover:border-orange-500/20 transition-all relative group overflow-x-auto">
          <div className="absolute top-4 right-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Kotlin Source Code</div>
          <code className="text-slate-300">
{`// 1. Repository Simplificado
class DisciplinaRepository @Inject constructor(
    private val disciplinaDao: DisciplinaDao,
    private val db: AppDatabase
) {
    fun listarDisciplinas(): Flow<List<DisciplinaEntity>> =
        disciplinaDao.listarDisciplinas()

    suspend fun zerarProgressoDisciplina(disciplinaId: Long) {
        db.withTransaction {
            disciplinaDao.zerarProgresso(disciplinaId)
            disciplinaDao.resetarTopicos(disciplinaId)
        }
    }
}

// 2. ViewModel Reativo (Hilt + StateFlow)
@HiltViewModel
class DisciplinaViewModel @Inject constructor(
    private val repository: DisciplinaRepository
) : ViewModel() {

    val disciplinas: StateFlow<List<DisciplinaEntity>> =
        repository.listarDisciplinas()
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = emptyList()
            )

    fun zerarProgresso(disciplinaId: Long) {
        viewModelScope.launch { repository.zerarProgressoDisciplina(disciplinaId) }
    }
}

// 3. UI Component (Jetpack Compose Screen)
@Composable
fun DisciplinasScreen(viewModel: DisciplinaViewModel) {
    val disciplinas by viewModel.disciplinas.collectAsState()

    LazyColumn {
        items(disciplinas, key = { it.id }) { disciplina ->
            DisciplinaCard(disciplina, viewModel)
        }
    }
}

// 4. UI Component (Jetpack Compose Card)
@Composable
fun DisciplinaCard(
    disciplina: DisciplinaEntity,
    viewModel: DisciplinaViewModel
) {
    Card(Modifier.fillMaxWidth().padding(8.dp)) {
        Column(Modifier.padding(16.dp)) {
            Text(disciplina.nome, fontWeight = FontWeight.Bold)
            Text("Progresso: \${disciplina.progresso}%")
            TextButton(onClick = { viewModel.zerarProgresso(disciplina.id) }) {
                Text("Zerar progresso")
            }
        }
    }
}`}
          </code>
        </div>
      </section>

      <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-2xl">
        <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
          <Database size={18} /> Sincronização em Tempo Real
        </h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          O aplicativo utiliza o padrão <strong>Single Source of Truth</strong>. Qualquer alteração nas disciplinas no 
          <em>SubjectList</em> reflete instantaneamente nas abas de <em>Desempenho</em> e <em>Dashboard</em>. 
          A arquitetura reativa garante que os dados estejam sempre consistentes entre as diferentes visões do app.
        </p>
      </div>
    </div>
  );
};

export default ArchDocs;
