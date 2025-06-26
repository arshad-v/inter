export enum AppPhase {
  JOB_INPUT = 'JOB_INPUT',
  GENERATING_QUESTIONS = 'GENERATING_QUESTIONS',
  INTERVIEWING = 'INTERVIEWING',
  GENERATING_FEEDBACK = 'GENERATING_FEEDBACK',
  FEEDBACK_READY = 'FEEDBACK_READY',
  ERROR = 'ERROR',
}

export interface InterviewEntry {
  question: string;
  answer: string;
  videoDataUrl?: string; // Optional: base64 data URL of the recorded video
}