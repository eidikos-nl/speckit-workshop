import { selectRandomQuestionSet } from '@/lib/gameLogic';
import { QuestionSet } from '@/lib/types';

// Mock question sets for testing
const mockQuestionSet1: QuestionSet = {
  id: 'test-set-1',
  theme: 'Test Theme 1',
  targetWord: 'TESTWORDONE1',
  questions: Array(12).fill(null).map((_, i) => ({
    id: `test-1-q${i + 1}`,
    question: `Question ${i + 1}`,
    answer: `Answer ${i + 1}`,
    revealedLetter: 'T',
  })),
};

const mockQuestionSet2: QuestionSet = {
  id: 'test-set-2',
  theme: 'Test Theme 2',
  targetWord: 'TESTWORDTWO2',
  questions: Array(12).fill(null).map((_, i) => ({
    id: `test-2-q${i + 1}`,
    question: `Question ${i + 1}`,
    answer: `Answer ${i + 1}`,
    revealedLetter: 'E',
  })),
};

const mockQuestionSet3: QuestionSet = {
  id: 'test-set-3',
  theme: 'Test Theme 3',
  targetWord: 'TESTWORDTHR3',
  questions: Array(12).fill(null).map((_, i) => ({
    id: `test-3-q${i + 1}`,
    question: `Question ${i + 1}`,
    answer: `Answer ${i + 1}`,
    revealedLetter: 'S',
  })),
};

describe('selectRandomQuestionSet', () => {
  // T022: Returns element from input array
  it('should return an element from the input array', () => {
    const sets = [mockQuestionSet1, mockQuestionSet2, mockQuestionSet3];
    const selected = selectRandomQuestionSet(sets);
    
    expect(sets).toContain(selected);
  });

  // T023: Throws error when array is empty
  it('should throw an error when array is empty', () => {
    expect(() => {
      selectRandomQuestionSet([]);
    }).toThrow('Cannot select from empty question sets array');
  });

  // T024: Selects first item when Math.random returns 0
  it('should select first item when Math.random returns 0', () => {
    const sets = [mockQuestionSet1, mockQuestionSet2, mockQuestionSet3];
    
    // Mock Math.random to return 0
    jest.spyOn(global.Math, 'random').mockReturnValue(0);
    
    const selected = selectRandomQuestionSet(sets);
    
    expect(selected).toBe(mockQuestionSet1);
    
    // Restore original Math.random
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  // T025: Selects last item when Math.random returns 0.99
  it('should select last item when Math.random returns 0.99', () => {
    const sets = [mockQuestionSet1, mockQuestionSet2, mockQuestionSet3];
    
    // Mock Math.random to return 0.99 (will result in index 2 for array of length 3)
    jest.spyOn(global.Math, 'random').mockReturnValue(0.99);
    
    const selected = selectRandomQuestionSet(sets);
    
    expect(selected).toBe(mockQuestionSet3);
    
    // Restore original Math.random
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  // T026: Covers all sets over multiple iterations (statistical test)
  it('should cover all sets over multiple iterations with reasonable distribution', () => {
    const sets = [mockQuestionSet1, mockQuestionSet2, mockQuestionSet3];
    const selectionCounts = new Map<string, number>();
    const iterations = 300; // Enough iterations for statistical significance
    
    // Initialize counts
    sets.forEach(set => selectionCounts.set(set.id, 0));
    
    // Run multiple selections
    for (let i = 0; i < iterations; i++) {
      const selected = selectRandomQuestionSet(sets);
      const currentCount = selectionCounts.get(selected.id) || 0;
      selectionCounts.set(selected.id, currentCount + 1);
    }
    
    // Verify all sets were selected at least once
    sets.forEach(set => {
      const count = selectionCounts.get(set.id) || 0;
      expect(count).toBeGreaterThan(0);
    });
    
    // Verify reasonable distribution (each should be roughly 1/3 of iterations)
    // With 300 iterations and 3 sets, expect ~100 each, allow 30-170 range (loose bounds)
    sets.forEach(set => {
      const count = selectionCounts.get(set.id) || 0;
      expect(count).toBeGreaterThan(30);
      expect(count).toBeLessThan(170);
    });
  });

  it('should work with a single question set', () => {
    const sets = [mockQuestionSet1];
    const selected = selectRandomQuestionSet(sets);
    
    expect(selected).toBe(mockQuestionSet1);
  });

  it('should work with two question sets', () => {
    const sets = [mockQuestionSet1, mockQuestionSet2];
    const selected = selectRandomQuestionSet(sets);
    
    expect([mockQuestionSet1, mockQuestionSet2]).toContain(selected);
  });
});