import {
  canNavigateNext,
  canNavigatePrevious,
  getNextQuestionIndex,
  getPreviousQuestionIndex,
  isValidQuestionIndex,
} from '../../lib/navigationLogic';

describe('navigationLogic', () => {
  describe('canNavigateNext', () => {
    it('should return true when not on the last question', () => {
      expect(canNavigateNext(0, 12)).toBe(true);
      expect(canNavigateNext(5, 12)).toBe(true);
      expect(canNavigateNext(10, 12)).toBe(true);
    });

    it('should return false when on the last question', () => {
      expect(canNavigateNext(11, 12)).toBe(false);
    });

    it('should handle edge case of single question', () => {
      expect(canNavigateNext(0, 1)).toBe(false);
    });
  });

  describe('canNavigatePrevious', () => {
    it('should return false when on the first question', () => {
      expect(canNavigatePrevious(0)).toBe(false);
    });

    it('should return true when not on the first question', () => {
      expect(canNavigatePrevious(1)).toBe(true);
      expect(canNavigatePrevious(5)).toBe(true);
      expect(canNavigatePrevious(11)).toBe(true);
    });
  });

  describe('getNextQuestionIndex', () => {
    it('should increment index when navigation is allowed', () => {
      expect(getNextQuestionIndex(0, 12)).toBe(1);
      expect(getNextQuestionIndex(5, 12)).toBe(6);
      expect(getNextQuestionIndex(10, 12)).toBe(11);
    });

    it('should return same index when on last question (boundary case)', () => {
      expect(getNextQuestionIndex(11, 12)).toBe(11);
    });

    it('should handle single question set', () => {
      expect(getNextQuestionIndex(0, 1)).toBe(0);
    });
  });

  describe('getPreviousQuestionIndex', () => {
    it('should decrement index when navigation is allowed', () => {
      expect(getPreviousQuestionIndex(1)).toBe(0);
      expect(getPreviousQuestionIndex(5)).toBe(4);
      expect(getPreviousQuestionIndex(11)).toBe(10);
    });

    it('should return same index when on first question (boundary case)', () => {
      expect(getPreviousQuestionIndex(0)).toBe(0);
    });
  });

  describe('isValidQuestionIndex', () => {
    it('should return true for valid indices', () => {
      expect(isValidQuestionIndex(0, 12)).toBe(true);
      expect(isValidQuestionIndex(5, 12)).toBe(true);
      expect(isValidQuestionIndex(11, 12)).toBe(true);
    });

    it('should return false for negative indices', () => {
      expect(isValidQuestionIndex(-1, 12)).toBe(false);
      expect(isValidQuestionIndex(-5, 12)).toBe(false);
    });

    it('should return false for indices >= totalQuestions', () => {
      expect(isValidQuestionIndex(12, 12)).toBe(false);
      expect(isValidQuestionIndex(13, 12)).toBe(false);
    });

    it('should handle edge case of single question', () => {
      expect(isValidQuestionIndex(0, 1)).toBe(true);
      expect(isValidQuestionIndex(1, 1)).toBe(false);
    });
  });
});