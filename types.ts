
export enum ViewState {
    DASHBOARD = 'DASHBOARD',
    STORY_LIBRARY = 'STORY_LIBRARY',
    WRITING_DESK = 'WRITING_DESK', 
    OUTLINE_WORLD = 'OUTLINE_WORLD',
    DATA_LIBRARY = 'DATA_LIBRARY',
    RECYCLE_BIN = 'RECYCLE_BIN',
    IDEA_GENIE = 'IDEA_GENIE',
}

export type CharacterRole = '主角' | '反派' | '配角' | '路人' | string;

export interface StoryInputs {
    genre: string; 
    theme: string; 
    hero: string; 
    setting: string; 
}

export interface StoryConcept {
    title: string;
    synopsis: string;
    characterName: string;
    characterRole: string;
    characterDesc: string;
    characterConflict: string;
}
aracter {
    id: string;
    storyId: string; 
    name: string;
    role: CharacterRole;
    bio?: string;
    conflict: string; 
    obstacle: string; 
    action: string;    
    ending: string;    
   
    description?: string;
    appearance?: string;
    relationships?: string;
    growthArc?: string; 
}

export interface Relationship {
    id: string;
    storyId: string;
    sourceCharacterId: string;
    targetCharacterId: string;
    type: string; 
    description: string;
}

export interface OutlinePoint {
    stage: string; 
    tension: number; 
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
    povCharacterId?: string; 
}

export interface Story {
    id: string;
    userId: string; 
    title: string;
    genre: string; 
    synopsis: string;
    coverColor: string;
    currentText: string; 
    updatedAt: number;
}


export interface Message {
    role: 'user' | 'model';
    text: string;
}

export interface TrashItem {
    id: string;
    originalId: string;
    type: 'STORY' | 'CHARACTER' | 'OUTLINE' | 'CHAPTER' | 'RELATIONSHIP'; 
    data: any; 
    deletedAt: number;
    title: string;
}

export interface AiToolsProps {
    currentText: string;
    onTextGenerated: (text: string) => void;
    onCharactersExtracted: (chars: Partial<Character>[]) => void;
    onOutlineGenerated: (points: OutlinePoint[]) => void;
    isProcessing: boolean;
}
