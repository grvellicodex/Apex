export type ApplicationStatus = 'Interested' | 'Applying' | 'Submitted' | 'Accepted' | 'Waitlisted' | 'Rejected' | 'Deferred';

export interface Synapse {
  id: string;
  title: string;
  isCompleted: boolean;
  resonanceReward: number;
}

export interface NeuralNode {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'illuminated';
  synapses: Synapse[];
  discipline: 'Algorithmic Aesthetics' | 'Generative Philosophy' | 'Data Alchemy';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  content: string;
  category: 'Observation' | 'Inspiration' | 'Philosophy';
}

export interface ComputationalLoad {
  campus: number; // 0-100
  clusters: { name: string; load: number }[];
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface DraftRevision {
  id: string;
  timestamp: string;
  content: string;
  label: string;
  notes?: string;
}

export interface College {
  id: string;
  name: string;
  location: string;
  ranking?: number;
  deadline: string;
  status: ApplicationStatus;
  tasks: Task[];
  equityScore?: number;
  notes?: string;
  essayPrompts: string[];
  disciplineBias?: number; // 0 (Mathematics) to 100 (Translation)
  draftRevisions?: DraftRevision[];
  observationLogs?: LogEntry[];
  financialAid?: {
    status: 'Not Started' | 'Applying' | 'Submitted' | 'Awarded';
    value?: number;
    tasks: Task[];
  };
}

export interface DashboardStats {
  totalApplications: number;
  completedTasks: number;
  upcomingDeadlinesCount: number;
  acceptanceRate?: number;
}
