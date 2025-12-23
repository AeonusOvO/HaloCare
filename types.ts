export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ 
    type: string; 
    text?: string; 
    image_url?: { url: string };
    input_audio?: { data: string; format?: string };
  }>;
  reasoning_content?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  symptoms: string[];
  tongueImage?: string; // Base64
  constitution?: string; // Tizhi (e.g., Yin Deficiency)
  dietPlan?: string;
  schedulePlan?: string;
}

export interface DoctorDiagnosis {
  id: string;
  name: string;
  title: string;
  avatar: string;
  diagnosis: string;
  prescription: string;
  thinking?: string;
}

export enum AppView {
  HOME = 'HOME',
  LEARNING = 'LEARNING',
  AI_DIAGNOSIS = 'AI_DIAGNOSIS',
  COMMUNITY = 'COMMUNITY',
  PROFILE = 'PROFILE',
  // Keep legacy for sub-view or internal routing if needed, or map them to new views
  HEALTH_PROFILE = 'HEALTH_PROFILE', 
  CONSULTATION = 'CONSULTATION',
  BUTLER = 'BUTLER'
}