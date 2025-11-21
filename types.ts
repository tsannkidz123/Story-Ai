export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  STORY_LIBRARY = 'STORY_LIBRARY',
  WRITING_DESK = 'WRITING_DESK', // The editor
  OUTLINE_WORLD = 'OUTLINE_WORLD',
  DATA_LIBRARY = 'DATA_LIBRARY',
  RECYCLE_BIN = 'RECYCLE_BIN',
  IDEA_GENIE = 'IDEA_GENIE',
}

export type CharacterRole = '主角' | '反派' | '配角' | '路人' | string;

export interface Character {
  id: string;
  storyId: string;
  name: string;
  role: CharacterRole;
  bio?: string; // New: Freeform biography/document content
  // Core 4 - Story Drivers
  conflict: string; // 冲突
  obstacle: string; // 阻碍
  action: string;   // 行动
  ending: string;   // 结局
  // Details
  description?: string;
  appearance?: string; // 外貌
  relationships?: string; // Deprecated text field, keeping for compatibility, moving to Relationship entity
  growthArc?: string; // 成长曲线
}

export interface Relationship {
  id: string;
  storyId: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  type: string; // e.g., "Friend", "Enemy", "Family", "Rival"
  description: string;
}

export interface OutlinePoint {
  stage: string; // e.g., "Inciting Incident", "Climax"
  tension: number; // 0-100
  description: string;
}

export interface Outline {
  id: string;
  storyId: string;
  title: string;
  points: OutlinePoint[];
}

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  content: string;
  order: number;
  povCharacterId?: string; // New: Point of View Character
}

export interface Story {
  id: string;
  title: string;
  synopsis: string;
  coverColor: string;
  createdAt: number;
  updatedAt: number;
}

export interface TrashItem {
  id: string;
  originalId: string;
  type: 'STORY' | 'CHARACTER' | 'OUTLINE';
  data: any;
  deletedAt: number;
  title: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface AiToolsProps {
  currentText: string;
  onTextGenerated: (text: string) => void;
  onCharactersExtracted: (chars: Partial<Character>[]) => void;
  onOutlineGenerated: (points: OutlinePoint[]) => void;
  isProcessing: boolean;
}

export interface StoryConcept {
  title: string;
  synopsis: string;
  characterName: string;
  characterRole: string;
  characterDesc: string;
  characterConflict: string;
}
