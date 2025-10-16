'use client';

/**
 * ScorePanel displays the player's current score in a floating panel
 *
 * Matches the styling and positioning of TimerPanel to maintain visual consistency:
 * - Fixed positioning in bottom-left corner (z-50)
 * - Score display with label
 * - Shadow effect for visual separation
 * - Accessibility: aria-live and aria-labels
 *
 * @param score - The current accumulated score
 * @param dataTestId - Optional test ID for E2E testing (default: 'score-panel')
 */
interface ScorePanelProps {
  score: number;
  dataTestId?: string;
}

export function ScorePanel({ score, dataTestId = 'score-panel' }: ScorePanelProps) {
  return (
    // Fixed positioning with bottom-left placement and high z-index
    <div
      className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4 min-w-[120px]"
      data-testid={dataTestId}
      aria-live="polite"
      aria-label="Game score display"
    >
      <div className="space-y-3 text-center">
        {/* Score Label */}
        <div className="text-2xl font-semibold text-gray-600">Score</div>

        {/* Separator */}
        <div className="border-t border-gray-300"></div>

        {/* Score Display */}
        <div
          className="text-2xl font-mono font-bold text-gray-900"
          data-testid="score-value"
          aria-label={`Current score: ${score} points`}
        >
          {score}
        </div>
      </div>
    </div>
  );
}
