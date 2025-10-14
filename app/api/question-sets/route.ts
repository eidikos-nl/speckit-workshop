import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { QuestionSet, Question } from '@/lib/types';

/**
 * Raw question format from JSON files
 */
interface RawQuestion {
  question: string;
  answer: string;
  letterPosition: number;
  letter: string;
}

/**
 * Raw question set format from JSON files
 */
interface RawQuestionSet {
  theme: string;
  mainAnswer: string;
  difficulty: string;
  language: string;
  questions: RawQuestion[];
}

/**
 * Transform raw question set from JSON to application QuestionSet type
 */
function transformQuestionSet(raw: RawQuestionSet, setId: string): QuestionSet {
  const questions: Question[] = raw.questions.map((q, index) => ({
    id: `${setId}-q${index + 1}`,
    question: q.question,
    answer: q.answer,
    revealedLetter: q.letter,
  }));

  return {
    id: setId,
    theme: raw.theme,
    targetWord: raw.mainAnswer,
    questions,
  };
}

/**
 * GET /api/question-sets
 * Returns all available question sets
 */
export async function GET() {
  try {
    const questionSetsDir = path.join(process.cwd(), 'question-sets');
    
    // Read all files in the directory
    const files = await fs.readdir(questionSetsDir);
    
    // Filter for .json files and sort them
    const jsonFiles = files
      .filter(file => file.endsWith('.json'))
      .sort();
    
    // Load and transform each file
    const questionSets: QuestionSet[] = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(questionSetsDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const rawSet: RawQuestionSet = JSON.parse(fileContent);
      
      // Extract set ID from filename (e.g., "set-1.json" -> "set-1")
      const setId = path.basename(file, '.json');
      
      questionSets.push(transformQuestionSet(rawSet, setId));
    }
    
    return NextResponse.json(questionSets);
  } catch (error) {
    console.error('Error loading question sets:', error);
    return NextResponse.json(
      { error: 'Failed to load question sets' },
      { status: 500 }
    );
  }
}