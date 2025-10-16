/**
 * Unit tests for scoring logic functions
 *
 * These tests verify the pure scoring calculation functions
 * used throughout the game to track player performance
 */

import {
  calculateAnswerScore,
  addTimeBonus,
  calculateFinalScore,
  hasAnsweredNQuestions,
  validateScoreState,
} from '@/lib/scoringLogic';

describe('Score Calculations', () => {
  describe('calculateAnswerScore', () => {
    it('should add 10 points for a correct answer', () => {
      expect(calculateAnswerScore(true, 100)).toBe(110);
      expect(calculateAnswerScore(true, 0)).toBe(10);
      expect(calculateAnswerScore(true, 50)).toBe(60);
    });

    it('should subtract 1 point for an incorrect answer', () => {
      expect(calculateAnswerScore(false, 100)).toBe(99);
      expect(calculateAnswerScore(false, 50)).toBe(49);
      expect(calculateAnswerScore(false, 1)).toBe(0);
    });

    it('should never allow score to go below 0', () => {
      expect(calculateAnswerScore(false, 0)).toBe(0);
      expect(calculateAnswerScore(false, 0)).not.toBe(-1);
    });

    it('should handle multiple incorrect answers correctly', () => {
      let score = 5;
      score = calculateAnswerScore(false, score); // 5 - 1 = 4
      score = calculateAnswerScore(false, score); // 4 - 1 = 3
      score = calculateAnswerScore(false, score); // 3 - 1 = 2
      expect(score).toBe(2);
    });

    it('should handle mixed correct and incorrect answers', () => {
      let score = 0;
      score = calculateAnswerScore(true, score);  // 0 + 10 = 10
      score = calculateAnswerScore(true, score);  // 10 + 10 = 20
      score = calculateAnswerScore(false, score); // 20 - 1 = 19
      score = calculateAnswerScore(true, score);  // 19 + 10 = 29
      expect(score).toBe(29);
    });
  });

  describe('addTimeBonus', () => {
    it('should add the seconds remaining as bonus points', () => {
      expect(addTimeBonus(100, 50)).toBe(150);
      expect(addTimeBonus(100, 120)).toBe(220);
      expect(addTimeBonus(0, 60)).toBe(60);
    });

    it('should add 0 bonus when 0 seconds remaining', () => {
      expect(addTimeBonus(100, 0)).toBe(100);
      expect(addTimeBonus(500, 0)).toBe(500);
    });

    it('should work correctly at various time values', () => {
      expect(addTimeBonus(200, 1)).toBe(201);
      expect(addTimeBonus(200, 10)).toBe(210);
      expect(addTimeBonus(200, 100)).toBe(300);
    });

    it('should floor decimal seconds if they occur', () => {
      // Even though in practice we use integers, verify floor behavior
      expect(addTimeBonus(100, 59.7)).toBe(159);
      expect(addTimeBonus(100, 30.2)).toBe(130);
    });
  });

  describe('calculateFinalScore', () => {
    it('should preserve score when final word is correct', () => {
      expect(calculateFinalScore(500, true)).toBe(500);
      expect(calculateFinalScore(0, true)).toBe(0);
      expect(calculateFinalScore(1200, true)).toBe(1200);
    });

    it('should reset score to 0 when final word is incorrect', () => {
      expect(calculateFinalScore(500, false)).toBe(0);
      expect(calculateFinalScore(1000, false)).toBe(0);
      expect(calculateFinalScore(1, false)).toBe(0);
    });

    it('should handle edge case of 0 score with incorrect final word', () => {
      expect(calculateFinalScore(0, false)).toBe(0);
    });

    it('should reflect the all-or-nothing nature of final word', () => {
      // Same starting score but different outcomes
      const startScore = 750;
      expect(calculateFinalScore(startScore, true)).toBe(750);
      expect(calculateFinalScore(startScore, false)).toBe(0);
    });
  });

  describe('hasAnsweredNQuestions', () => {
    it('should return true when exactly N questions have been answered', () => {
      const collected = {
        1: 'A',
        2: 'B',
        3: null,
        4: null,
        5: null,
        6: null,
        7: null,
        8: null,
        9: null,
        10: null,
        11: null,
        12: null,
      };
      expect(hasAnsweredNQuestions(collected, 2)).toBe(true);
    });

    it('should return true when all 12 questions are answered', () => {
      const collected = {
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'D',
        5: 'E',
        6: 'F',
        7: 'G',
        8: 'H',
        9: 'I',
        10: 'J',
        11: 'K',
        12: 'L',
      };
      expect(hasAnsweredNQuestions(collected, 12)).toBe(true);
    });

    it('should return false when fewer than N questions answered', () => {
      const collected = {
        1: 'A',
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
        7: null,
        8: null,
        9: null,
        10: null,
        11: null,
        12: null,
      };
      expect(hasAnsweredNQuestions(collected, 2)).toBe(false);
      expect(hasAnsweredNQuestions(collected, 12)).toBe(false);
    });

    it('should return false when more than N questions answered but N is specified', () => {
      const collected = {
        1: 'A',
        2: 'B',
        3: 'C',
        4: null,
        5: null,
        6: null,
        7: null,
        8: null,
        9: null,
        10: null,
        11: null,
        12: null,
      };
      expect(hasAnsweredNQuestions(collected, 2)).toBe(false); // 3 answered, not 2
      expect(hasAnsweredNQuestions(collected, 3)).toBe(true);
    });

    it('should default to 12 questions when not specified', () => {
      const collected = {
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'D',
        5: 'E',
        6: 'F',
        7: 'G',
        8: 'H',
        9: 'I',
        10: 'J',
        11: 'K',
        12: 'L',
      };
      expect(hasAnsweredNQuestions(collected)).toBe(true);
    });
  });

  describe('validateScoreState', () => {
    it('should validate correct score state', () => {
      expect(validateScoreState(100, false)).toEqual([]);
      expect(validateScoreState(0, false)).toEqual([]);
      expect(validateScoreState(1200, false)).toEqual([]);
      expect(validateScoreState(100, true)).toEqual([]);
    });

    it('should reject negative scores', () => {
      const errors = validateScoreState(-1, false);
      expect(errors).toContain('Score cannot be negative');
    });

    it('should reject scores exceeding maximum', () => {
      const errors = validateScoreState(1201, false);
      expect(errors).toContain('Score exceeds theoretical maximum of 1200');
    });

    it('should reject non-integer scores', () => {
      const errors = validateScoreState(100.5, false);
      expect(errors).toContain('Score must be an integer');
    });

    it('should reject non-boolean isFailed values', () => {
      // @ts-ignore - Testing runtime validation
      const errors = validateScoreState(100, 'false');
      expect(errors).toContain('isFailed must be a boolean');
    });

    it('should accumulate multiple errors', () => {
      const errors = validateScoreState(-100.5, false);
      expect(errors.length).toBeGreaterThan(1);
      expect(errors).toContain('Score must be an integer');
      expect(errors).toContain('Score cannot be negative');
    });
  });
});
