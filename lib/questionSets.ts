import { QuestionSet } from './types';

/**
 * Loads all question sets from the API
 * 
 * This function:
 * - Fetches question sets from the /api/question-sets endpoint
 * - Returns an array of all available question sets
 * 
 * @returns Promise resolving to array of QuestionSet objects
 * @throws Error if fetch fails or returns error
 */
export async function loadQuestionSets(): Promise<QuestionSet[]> {
  try {
    const response = await fetch('/api/question-sets');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch question sets: ${response.statusText}`);
    }
    
    const questionSets: QuestionSet[] = await response.json();
    return questionSets;
  } catch (error) {
    console.error('Error loading question sets:', error);
    throw new Error(`Failed to load question sets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a specific question set by ID from loaded sets
 */
export function getQuestionSetById(sets: QuestionSet[], id: string): QuestionSet | undefined {
  return sets.find(set => set.id === id);
}

/**
 * Get the total number of question sets
 */
export function getQuestionSetCount(sets: QuestionSet[]): number {
  return sets.length;
}