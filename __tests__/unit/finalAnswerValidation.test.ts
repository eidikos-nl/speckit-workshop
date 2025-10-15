/**
 * Unit tests for final answer validation
 *
 * Tests the validateFinalAnswer function from lib/validationLogic.ts
 * Validates case-insensitive matching, win/loss outcomes, and metadata handling
 */

import { validateFinalAnswer } from '@/lib/validationLogic';

describe('validateFinalAnswer', () => {
  describe('Win scenarios - case-insensitive matching', () => {
    it('should return win when answers match exactly (same case)', () => {
      const result = validateFinalAnswer('CONSTELLATION', 'CONSTELLATION');

      expect(result.outcome).toBe('win');
      expect(result.playerAnswer).toBe('constellation');
      expect(result.correctAnswer).toBe('constellation');
    });

    it('should return win when submitted answer has different case', () => {
      const result = validateFinalAnswer('Constellation', 'CONSTELLATION');

      expect(result.outcome).toBe('win');
      expect(result.playerAnswer).toBe('constellation');
      expect(result.correctAnswer).toBe('constellation');
    });

    it('should return win for lowercase submitted answer', () => {
      const result = validateFinalAnswer('constellation', 'CONSTELLATION');

      expect(result.outcome).toBe('win');
      expect(result.playerAnswer).toBe('constellation');
      expect(result.correctAnswer).toBe('constellation');
    });

    it('should return win when both answers have mixed case', () => {
      const result = validateFinalAnswer('CoNsTeLLaTiOn', 'cOnStElLaTiOn');

      expect(result.outcome).toBe('win');
      expect(result.playerAnswer).toBe('constellation');
      expect(result.correctAnswer).toBe('constellation');
    });

    it('should return win even with leading/trailing whitespace', () => {
      const result = validateFinalAnswer('  CONSTELLATION  ', '  CONSTELLATION  ');

      expect(result.outcome).toBe('win');
      expect(result.playerAnswer).toBe('constellation');
      expect(result.correctAnswer).toBe('constellation');
    });
  });

  describe('Loss scenarios - incorrect answers', () => {
    it('should return loss when submitted answer differs', () => {
      const result = validateFinalAnswer('INCORRECTWORD', 'CONSTELLATION');

      expect(result.outcome).toBe('loss');
      expect(result.playerAnswer).toBe('incorrectword');
      expect(result.correctAnswer).toBe('constellation');
    });

    it('should return loss for off-by-one character difference', () => {
      const result = validateFinalAnswer('CONSTELLATIAN', 'CONSTELLATION');

      expect(result.outcome).toBe('loss');
      expect(result.playerAnswer).toBe('constellatian');
      expect(result.correctAnswer).toBe('constellation');
    });

    it('should return loss for wrong case-insensitive answer', () => {
      const result = validateFinalAnswer('constellation', 'INCOMPLETE');

      expect(result.outcome).toBe('loss');
      expect(result.playerAnswer).toBe('constellation');
      expect(result.correctAnswer).toBe('incomplete');
    });

    it('should return loss for completely different word', () => {
      const result = validateFinalAnswer('AARDVARKBEAR', 'CONSTELLATION');

      expect(result.outcome).toBe('loss');
      expect(result.playerAnswer).toBe('aardvarkbear');
      expect(result.correctAnswer).toBe('constellation');
    });
  });

  describe('Metadata and timestamps', () => {
    it('should include valid ISO 8601 timestamp', () => {
      const result = validateFinalAnswer('CONSTELLATION', 'CONSTELLATION');
      const timestamp = new Date(result.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should contain normalized submitted answer', () => {
      const result = validateFinalAnswer('  ConStelLation  ', 'CONSTELLATION');

      expect(result.playerAnswer).toBe('constellation');
      expect(result.playerAnswer).not.toContain(' ');
    });

    it('should contain normalized correct answer', () => {
      const result = validateFinalAnswer('CONSTELLATION', '  ConStelLation  ');

      expect(result.correctAnswer).toBe('constellation');
      expect(result.correctAnswer).not.toContain(' ');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      const result = validateFinalAnswer('', '');

      expect(result.outcome).toBe('win');
      expect(result.playerAnswer).toBe('');
      expect(result.correctAnswer).toBe('');
    });

    it('should handle single character', () => {
      const result = validateFinalAnswer('A', 'A');

      expect(result.outcome).toBe('win');
      expect(result.playerAnswer).toBe('a');
      expect(result.correctAnswer).toBe('a');
    });

    it('should handle answers with special characters (preserved as-is)', () => {
      const result = validateFinalAnswer('test-word', 'TEST-WORD');

      expect(result.outcome).toBe('win');
      expect(result.playerAnswer).toBe('test-word');
      expect(result.correctAnswer).toBe('test-word');
    });
  });

  describe('Return value structure', () => {
    it('should always return object with required fields', () => {
      const result = validateFinalAnswer('TEST', 'TEST');

      expect(result).toHaveProperty('outcome');
      expect(result).toHaveProperty('playerAnswer');
      expect(result).toHaveProperty('correctAnswer');
      expect(result).toHaveProperty('timestamp');
    });

    it('should have outcome as only valid string', () => {
      const winResult = validateFinalAnswer('WORD', 'WORD');
      const lossResult = validateFinalAnswer('WORD', 'OTHER');

      expect(['win', 'loss']).toContain(winResult.outcome);
      expect(['win', 'loss']).toContain(lossResult.outcome);
    });
  });
});
