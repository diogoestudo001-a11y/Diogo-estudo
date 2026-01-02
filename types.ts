
export enum DifficultyLevel {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export enum TopicStatus {
  NOT_STARTED = 'NAO_INICIADO',
  IN_PROGRESS = 'EM_ESTUDO',
  COMPLETED = 'CONCLUIDO',
  REVISION_PENDING = 'REVISAO_PENDENTE'
}

export interface Subject {
  id: number;
  name: string;
  weight: number;
  difficulty: DifficultyLevel;
  color: string;
  iconUrl?: string;
  totalTopics: number;
  completedTopics: number;
  progresso: number;
  certas: number;
  erradas: number;
  examId?: string;
}

export interface Topic {
  id: number;
  disciplinaId: number;
  title: string;
  status: TopicStatus;
  isActive?: boolean;
  weight?: number;
  lastStudyDate?: string;
  certas?: number;
  erradas?: number;
}

export interface Exam {
  id: string;
  name: string;
  institution: string;
  subjects: string[];
}

export interface StudyPlanSession {
  day: string;
  subjects: {
    name: string;
    duration: number;
    done?: boolean;
    theoryMinutes?: number;
    questionsMinutes?: number;
  }[];
}

export enum CycleMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL'
}

export interface StudyPlan {
  id: number;
  examId: string;
  examName: string;
  hoursPerDay: number;
  daysPerWeek: number;
  weeklyHoursGoal: number;
  weeklyQuestionsGoal: number;
  subjectsPerDay: number;
  cycleMode: CycleMode;
  manualSequence?: string[];
  sessions: StudyPlanSession[];
  createdAt: string;
}

export interface StudySession {
  id: number;
  topicId: number;
  durationMinutes: number;
  date: string;
  questionsSolved: number;
  correctAnswers: number;
}

export interface UserProfile {
  name: string;
  targetExam: string;
  weeklyHours: number;
  examDate: string;
}
