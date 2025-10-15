import { normalizeAnswer, validateAnswer, AnswerValidationResult } from '@/lib/validationLogic';

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
