
export enum DifficultyLevel {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export enum TopicStatus {
  NOT_STARTED = 'Não Iniciado',
  IN_PROGRESS = 'Em Estudo',
  COMPLETED = 'Concluído',
  REVISION_PENDING = 'Revisão Pendente'
}

export interface Subject {
  id: string;
  name: string;
  weight: number;
  difficulty: DifficultyLevel;
  color: string;
  totalTopics: number;
  completedTopics: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  status: TopicStatus;
  lastStudyDate?: string;
}

export interface StudySession {
  id: string;
  topicId: string;
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
