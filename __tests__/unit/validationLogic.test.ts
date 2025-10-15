import {
  normalizeAnswer,
  validateAnswer,
  AnswerValidationResult,
  getDisplayLetter,
  isAnsweredCorrectly,
} from '@/lib/validationLogic';
import { CollectedLetters } from '@/lib/types';

/**
 * Unit tests for validation logic
 * Tests case-insensitive answer comparison and normalization
 */

describe('normalizeAnswer', () => {
  describe('Basic normalization', () => {
    it('converts uppercase to lowercase', () => {
      expect(normalizeAnswer('PARIS')).toBe('paris');
    });

    it('converts mixed case to lowercase', () => {
      expect(normalizeAnswer('PaRiS')).toBe('paris');
    });

    it('leaves lowercase unchanged', () => {
      expect(normalizeAnswer('paris')).toBe('paris');
    });
  });

  describe('Whitespace handling', () => {
    it('trims leading whitespace', () => {
      expect(normalizeAnswer('  paris')).toBe('paris');
    });

    it('trims trailing whitespace', () => {
      expect(normalizeAnswer('paris  ')).toBe('paris');
    });

    it('trims both leading and trailing whitespace', () => {
      expect(normalizeAnswer('  paris  ')).toBe('paris');
    });

    it('trims tabs and newlines', () => {
      expect(normalizeAnswer('\t\nParis\n\t')).toBe('paris');
    });

    it('does not remove internal spaces', () => {
      expect(normalizeAnswer('new york')).toBe('new york');
    });
  });

  describe('Special characters and unicode', () => {
    it('preserves accented characters', () => {
      expect(normalizeAnswer('Café')).toBe('café');
    });

    it('preserves numbers', () => {
      expect(normalizeAnswer('H2O')).toBe('h2o');
    });

    it('preserves punctuation', () => {
      expect(normalizeAnswer("O'Brien")).toBe("o'brien");
    });

    it('preserves hyphens', () => {
      expect(normalizeAnswer('X-Ray')).toBe('x-ray');
    });

    it('handles unicode characters', () => {
      expect(normalizeAnswer('München')).toBe('münchen');
    });

    it('preserves underscores', () => {
      expect(normalizeAnswer('test_case')).toBe('test_case');
    });
  });

  describe('Edge cases', () => {
    it('handles empty string', () => {
      expect(normalizeAnswer('')).toBe('');
    });

    it('handles string with only whitespace', () => {
      expect(normalizeAnswer('   ')).toBe('');
    });

    it('handles very long strings', () => {
      const longStr = 'A'.repeat(1000);
      expect(normalizeAnswer(longStr)).toBe('a'.repeat(1000));
    });

    it('handles single character', () => {
      expect(normalizeAnswer('A')).toBe('a');
    });

    it('handles strings with multiple consecutive spaces', () => {
      expect(normalizeAnswer('paris    france')).toBe('paris    france');
    });
  });
});

describe('validateAnswer', () => {
  describe('Exact matches (case-insensitive)', () => {
    it('matches identical lowercase answers', () => {
      const result = validateAnswer('paris', 'paris');
      expect(result.isCorrect).toBe(true);
      expect(result.normalizedSubmitted).toBe('paris');
      expect(result.normalizedCorrect).toBe('paris');
    });

    it('matches identical uppercase answers', () => {
      const result = validateAnswer('PARIS', 'PARIS');
      expect(result.isCorrect).toBe(true);
    });

    it('matches when submitted is lowercase and correct is uppercase', () => {
      const result = validateAnswer('paris', 'PARIS');
      expect(result.isCorrect).toBe(true);
    });

    it('matches when submitted is uppercase and correct is lowercase', () => {
      const result = validateAnswer('PARIS', 'paris');
      expect(result.isCorrect).toBe(true);
    });

    it('matches with mixed case variations', () => {
      const result = validateAnswer('PaRiS', 'pArIs');
      expect(result.isCorrect).toBe(true);
    });
  });

  describe('Whitespace normalization', () => {
    it('ignores leading whitespace in submitted answer', () => {
      const result = validateAnswer('  paris', 'paris');
      expect(result.isCorrect).toBe(true);
    });

    it('ignores trailing whitespace in submitted answer', () => {
      const result = validateAnswer('paris  ', 'paris');
      expect(result.isCorrect).toBe(true);
    });

    it('ignores both leading and trailing whitespace', () => {
      const result = validateAnswer('  paris  ', '  PARIS  ');
      expect(result.isCorrect).toBe(true);
    });

    it('preserves internal spaces in comparison', () => {
      const result = validateAnswer('new york', 'NEW YORK');
      expect(result.isCorrect).toBe(true);
    });
  });

  describe('Incorrect answers', () => {
    it('rejects completely different answers', () => {
      const result = validateAnswer('london', 'paris');
      expect(result.isCorrect).toBe(false);
      expect(result.normalizedSubmitted).toBe('london');
      expect(result.normalizedCorrect).toBe('paris');
    });

    it('rejects partial matches', () => {
      const result = validateAnswer('par', 'paris');
      expect(result.isCorrect).toBe(false);
    });

    it('rejects answers with extra characters', () => {
      const result = validateAnswer('paris france', 'paris');
      expect(result.isCorrect).toBe(false);
    });

    it('rejects answers with missing characters', () => {
      const result = validateAnswer('pari', 'paris');
      expect(result.isCorrect).toBe(false);
    });

    it('rejects answers with different punctuation', () => {
      const result = validateAnswer("OBrien", "O'Brien");
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('Empty and null-like answers', () => {
    it('rejects empty submitted answer against non-empty correct', () => {
      const result = validateAnswer('', 'paris');
      expect(result.isCorrect).toBe(false);
    });

    it('accepts empty submitted against empty correct', () => {
      const result = validateAnswer('', '');
      expect(result.isCorrect).toBe(true);
    });

    it('rejects whitespace-only submitted answer against non-empty correct', () => {
      const result = validateAnswer('   ', 'paris');
      expect(result.isCorrect).toBe(false);
    });

    it('accepts whitespace-only submitted against whitespace-only correct', () => {
      const result = validateAnswer('   ', '   ');
      expect(result.isCorrect).toBe(true);
    });
  });

  describe('Special characters and unicode', () => {
    it('matches accented characters case-insensitively', () => {
      const result = validateAnswer('CAFÉ', 'café');
      expect(result.isCorrect).toBe(true);
    });

    it('matches answers with numbers', () => {
      const result = validateAnswer('H2O', 'h2o');
      expect(result.isCorrect).toBe(true);
    });

    it('matches answers with hyphens', () => {
      const result = validateAnswer('X-RAY', 'x-ray');
      expect(result.isCorrect).toBe(true);
    });

    it('rejects if special character differs', () => {
      const result = validateAnswer('x ray', 'x-ray');
      expect(result.isCorrect).toBe(false);
    });

    it('handles unicode characters correctly', () => {
      const result = validateAnswer('MÜNCHEN', 'münchen');
      expect(result.isCorrect).toBe(true);
    });
  });

  describe('Result object structure', () => {
    it('returns proper AnswerValidationResult structure for correct answer', () => {
      const result = validateAnswer('PARIS', 'paris');
      expect(result).toHaveProperty('isCorrect');
      expect(result).toHaveProperty('normalizedSubmitted');
      expect(result).toHaveProperty('normalizedCorrect');
      expect(result.isCorrect).toBe(true);
      expect(typeof result.normalizedSubmitted).toBe('string');
      expect(typeof result.normalizedCorrect).toBe('string');
    });

    it('returns proper AnswerValidationResult structure for incorrect answer', () => {
      const result = validateAnswer('london', 'paris');
      expect(result).toHaveProperty('isCorrect');
      expect(result).toHaveProperty('normalizedSubmitted');
      expect(result).toHaveProperty('normalizedCorrect');
      expect(result.isCorrect).toBe(false);
      expect(result.normalizedSubmitted).toBe('london');
      expect(result.normalizedCorrect).toBe('paris');
    });
  });

  describe('Real-world examples', () => {
    it('validates geography question answers', () => {
      expect(validateAnswer('PARIS', 'Paris')).toMatchObject({ isCorrect: true });
      expect(validateAnswer('  London  ', 'london')).toMatchObject({ isCorrect: true });
      expect(validateAnswer('Berlin', 'PARIS')).toMatchObject({ isCorrect: false });
    });

    it('validates science question answers', () => {
      expect(validateAnswer('H2O', 'h2o')).toMatchObject({ isCorrect: true });
      expect(validateAnswer('OXYGEN', 'oxygen')).toMatchObject({ isCorrect: true });
      expect(validateAnswer('Hydrogen', 'NITROGEN')).toMatchObject({ isCorrect: false });
    });

    it('validates history question answers', () => {
      expect(validateAnswer('NAPOLEON', 'napoleon')).toMatchObject({ isCorrect: true });
      expect(validateAnswer('  1789  ', '1789')).toMatchObject({ isCorrect: true });
      expect(validateAnswer('1799', '1789')).toMatchObject({ isCorrect: false });
    });

    it('handles answers with apostrophes', () => {
      expect(validateAnswer("O'BRIEN", "o'brien")).toMatchObject({ isCorrect: true });
      expect(validateAnswer("DONT", "DON'T")).toMatchObject({ isCorrect: false });
    });

    it('handles hyphenated answers', () => {
      expect(validateAnswer('MOTHER-IN-LAW', 'mother-in-law')).toMatchObject({ isCorrect: true });
      expect(validateAnswer('MOTHERINLAW', 'mother-in-law')).toMatchObject({ isCorrect: false });
    });
  });

  describe('Performance considerations', () => {
    it('validates quickly with typical answer length', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        validateAnswer('paris', 'PARIS');
      }
      const end = performance.now();
      const avg = (end - start) / 1000;
      // Should be much less than 1ms per validation
      expect(avg).toBeLessThan(1);
    });

    it('validates quickly even with very long answers', () => {
      const longAnswer = 'a'.repeat(1000);
      const start = performance.now();
      validateAnswer(longAnswer, longAnswer.toUpperCase());
      const end = performance.now();
      // Should still be sub-millisecond
      expect(end - start).toBeLessThan(10);
    });
  });
});

/**
 * Unit tests for letter collection display helpers
 * Tests getDisplayLetter and isAnsweredCorrectly functions
 */

describe('getDisplayLetter', () => {
  describe('Displaying collected letters', () => {
    it('returns collected letter when letter exists', () => {
      const letters: CollectedLetters = { 1: 'S', 2: 'P', 3: 'C' };
      expect(getDisplayLetter(1, letters)).toBe('S');
      expect(getDisplayLetter(2, letters)).toBe('P');
      expect(getDisplayLetter(3, letters)).toBe('C');
    });

    it('returns period when position has null value', () => {
      const letters: CollectedLetters = { 1: 'S', 2: null, 3: 'C' };
      expect(getDisplayLetter(2, letters)).toBe('.');
    });

    it('returns period for all positions in empty collection', () => {
      const letters: CollectedLetters = {};
      for (let i = 1; i <= 12; i++) {
        expect(getDisplayLetter(i, letters)).toBe('.');
      }
    });
  });

  describe('All 12 question positions', () => {
    it('correctly displays letters for all positions 1-12', () => {
      const targetWord = 'SPECTRALISM';
      const letters: CollectedLetters = {
        1: 'S',
        2: 'P',
        3: 'E',
        4: 'C',
        5: 'T',
        6: 'R',
        7: 'A',
        8: 'L',
        9: 'I',
        10: 'S',
        11: 'M',
        12: null,
      };

      expect(getDisplayLetter(1, letters)).toBe('S');
      expect(getDisplayLetter(2, letters)).toBe('P');
      expect(getDisplayLetter(3, letters)).toBe('E');
      expect(getDisplayLetter(4, letters)).toBe('C');
      expect(getDisplayLetter(5, letters)).toBe('T');
      expect(getDisplayLetter(6, letters)).toBe('R');
      expect(getDisplayLetter(7, letters)).toBe('A');
      expect(getDisplayLetter(8, letters)).toBe('L');
      expect(getDisplayLetter(9, letters)).toBe('I');
      expect(getDisplayLetter(10, letters)).toBe('S');
      expect(getDisplayLetter(11, letters)).toBe('M');
      expect(getDisplayLetter(12, letters)).toBe('.');
    });

    it('displays only periods when no letters collected', () => {
      const letters: CollectedLetters = {
        1: null,
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

      for (let i = 1; i <= 12; i++) {
        expect(getDisplayLetter(i, letters)).toBe('.');
      }
    });
  });

  describe('Edge cases', () => {
    it('handles mixed collected and uncollected positions', () => {
      const letters: CollectedLetters = {
        1: 'A',
        2: null,
        3: 'B',
        4: null,
        5: 'C',
        6: null,
        7: 'D',
        8: null,
        9: 'E',
        10: null,
        11: 'F',
        12: null,
      };

      expect(getDisplayLetter(1, letters)).toBe('A');
      expect(getDisplayLetter(2, letters)).toBe('.');
      expect(getDisplayLetter(3, letters)).toBe('B');
      expect(getDisplayLetter(4, letters)).toBe('.');
    });

    it('handles undefined position gracefully', () => {
      const letters: CollectedLetters = { 1: 'S' };
      // Position 2 is not in the object - should return period
      expect(getDisplayLetter(2, letters)).toBe('.');
    });

    it('handles uppercase letters correctly', () => {
      const letters: CollectedLetters = { 1: 'X', 2: 'Y', 3: 'Z' };
      expect(getDisplayLetter(1, letters)).toBe('X');
      expect(getDisplayLetter(2, letters)).toBe('Y');
      expect(getDisplayLetter(3, letters)).toBe('Z');
    });
  });
});

describe('isAnsweredCorrectly', () => {
  describe('Detecting answered questions', () => {
    it('returns true when letter is collected', () => {
      const letters: CollectedLetters = { 1: 'S', 2: 'P', 3: 'C' };
      expect(isAnsweredCorrectly(1, letters)).toBe(true);
      expect(isAnsweredCorrectly(2, letters)).toBe(true);
      expect(isAnsweredCorrectly(3, letters)).toBe(true);
    });

    it('returns false when position has null value', () => {
      const letters: CollectedLetters = { 1: 'S', 2: null, 3: 'C' };
      expect(isAnsweredCorrectly(2, letters)).toBe(false);
    });

    it('returns false for all positions in empty collection', () => {
      const letters: CollectedLetters = {};
      for (let i = 1; i <= 12; i++) {
        expect(isAnsweredCorrectly(i, letters)).toBe(false);
      }
    });

    it('returns false for undefined positions', () => {
      const letters: CollectedLetters = { 1: 'S' };
      expect(isAnsweredCorrectly(2, letters)).toBe(false);
    });
  });

  describe('All 12 question positions', () => {
    it('correctly identifies answered status for all positions', () => {
      const letters: CollectedLetters = {
        1: 'S',
        2: 'P',
        3: 'E',
        4: null,
        5: 'T',
        6: null,
        7: 'A',
        8: null,
        9: 'I',
        10: null,
        11: 'M',
        12: null,
      };

      // Answered positions
      expect(isAnsweredCorrectly(1, letters)).toBe(true);
      expect(isAnsweredCorrectly(2, letters)).toBe(true);
      expect(isAnsweredCorrectly(3, letters)).toBe(true);
      expect(isAnsweredCorrectly(5, letters)).toBe(true);
      expect(isAnsweredCorrectly(7, letters)).toBe(true);
      expect(isAnsweredCorrectly(9, letters)).toBe(true);
      expect(isAnsweredCorrectly(11, letters)).toBe(true);

      // Unanswered positions
      expect(isAnsweredCorrectly(4, letters)).toBe(false);
      expect(isAnsweredCorrectly(6, letters)).toBe(false);
      expect(isAnsweredCorrectly(8, letters)).toBe(false);
      expect(isAnsweredCorrectly(10, letters)).toBe(false);
      expect(isAnsweredCorrectly(12, letters)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('distinguishes between null and undefined', () => {
      const letters: CollectedLetters = { 1: null };
      expect(isAnsweredCorrectly(1, letters)).toBe(false); // Explicit null
      expect(isAnsweredCorrectly(2, letters)).toBe(false); // Undefined (not in object)
    });

    it('works with complete collection', () => {
      const letters: CollectedLetters = {
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

      for (let i = 1; i <= 12; i++) {
        expect(isAnsweredCorrectly(i, letters)).toBe(true);
      }
    });

    it('works with no answers collected', () => {
      const letters: CollectedLetters = {
        1: null,
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

      for (let i = 1; i <= 12; i++) {
        expect(isAnsweredCorrectly(i, letters)).toBe(false);
      }
    });
  });

  describe('Real-world game scenarios', () => {
    it('tracks progress through a game session', () => {
      let letters: CollectedLetters = {
        1: null,
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

      // Player answers question 1
      letters = { ...letters, 1: 'S' };
      expect(isAnsweredCorrectly(1, letters)).toBe(true);
      expect(isAnsweredCorrectly(2, letters)).toBe(false);

      // Player answers question 3
      letters = { ...letters, 3: 'E' };
      expect(isAnsweredCorrectly(1, letters)).toBe(true);
      expect(isAnsweredCorrectly(3, letters)).toBe(true);
      expect(isAnsweredCorrectly(2, letters)).toBe(false);

      // Player gets question 5 wrong (still null)
      expect(isAnsweredCorrectly(5, letters)).toBe(false);

      // Player answers question 5
      letters = { ...letters, 5: 'C' };
      expect(isAnsweredCorrectly(5, letters)).toBe(true);
    });

    it('counts answered questions correctly', () => {
      const letters: CollectedLetters = {
        1: 'S',
        2: null,
        3: 'E',
        4: null,
        5: 'C',
        6: null,
        7: 'T',
        8: null,
        9: 'R',
        10: null,
        11: 'A',
        12: null,
      };

      const answeredCount = Array.from({ length: 12 }, (_, i) =>
        isAnsweredCorrectly(i + 1, letters) ? 1 : 0
      ).reduce((a, b) => a + b, 0);

      expect(answeredCount).toBe(6);
    });
  });
});
