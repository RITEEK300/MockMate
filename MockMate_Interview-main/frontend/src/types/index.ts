export type InterviewType = 'HR' | 'TECHNICAL';
export type InterviewRole = 'INTERVIEWER' | 'CANDIDATE';

export interface AuthPayload {
  token: string;
  userId: string;
  name: string;
  email: string;
}

export interface AuthFormPayload {
  name?: string;
  email: string;
  password: string;
}

export interface MatchRequest {
  interviewType: InterviewType;
  preferredRole?: InterviewRole | null;
}

export interface MatchStatusResponse {
  status: 'IDLE' | 'QUEUED' | 'MATCHED' | 'CANCELLED';
  roomId: string | null;
  note: string;
}

export interface RoomState {
  roomId: string;
  interviewType: InterviewType;
  assignedRole: InterviewRole;
  partnerId: string;
  partnerName: string;
  durationSeconds: number;
  questions: string[];
  initiator: boolean;
}

export interface SignalMessage {
  clientSignalId: string;
  roomId: string;
  type: 'offer' | 'answer' | 'ice' | 'retry';
  senderId: string;
  payload: Record<string, unknown>;
}

export interface ChatMessage {
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  sentAt: string;
}

export interface FeedbackPayload {
  roomId: string;
  targetUserId: string;
  rating: number;
  summary: string;
  highlights: string[];
  improvements: string[];
}
