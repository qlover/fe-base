import { describe, expect, it } from 'vitest';
import { UserFeedbackStatus } from '@schemas/UserFeedbackSchema';
import { FeedbackIssueStatusResolver } from '@server/services/feedback-github/FeedbackIssueStatusResolver';

describe('FeedbackIssueStatusResolver', () => {
  const resolver = new FeedbackIssueStatusResolver();

  it.each([
    ['closed', 'completed', UserFeedbackStatus.resolved],
    ['closed', null, UserFeedbackStatus.resolved],
    ['closed', 'not_planned', UserFeedbackStatus.closed],
    ['closed', 'duplicate', UserFeedbackStatus.closed],
    ['reopened', null, UserFeedbackStatus.open],
    ['labeled', null, null]
  ] as const)('maps %s (%s) → %s', (action, reason, expected) => {
    expect(
      resolver.resolve({
        action,
        issue: { number: 1, state_reason: reason },
        repository: { full_name: 'owner/repo' }
      })
    ).toBe(expected);
  });
});
