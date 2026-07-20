// GitHub Issue Export Helper (app/lib/githubIssueTemplate.ts)
// Generates a formatted GitHub issue body from a high-quality feedback entry.
// Admin can call this to export FeatureRequest feedbacks for the repo.

const REPO_OWNER = 'soms3r';
const REPO_NAME = 'kakatua';

interface FeedbackForIssue {
  id: string;
  message: string;
  category: string;
  contactInfo: string | null;
  createdAt: string;
}

/**
 * Builds a GitHub issue body string from a feedback entry.
 */
export function buildGitHubIssueBody(feedback: FeedbackForIssue): string {
  const lines = [
    '---',
    '',
    '### Origin',
    `Feedback ID: \`${feedback.id}\``,
    `Created: ${feedback.createdAt}`,
    feedback.contactInfo ? `Contact: ${feedback.contactInfo}` : null,
    '',
    '---',
    '',
    '### Suggestion',
    '',
    feedback.message,
    '',
    '---',
    '',
    `_Auto-generated from the Flock Feedback system._`,
  ];

  return lines.filter(Boolean).join('\n');
}

/**
 * Returns the URL to pre-fill a new GitHub issue with the feedback as the body.
 * Opens the user's browser to create the issue.
 */
export function getGitHubIssueUrl(feedback: FeedbackForIssue): string {
  const title = encodeURIComponent(
    `[Flock Feedback] ${feedback.message.slice(0, 80)}${feedback.message.length > 80 ? '...' : ''}`
  );
  const body = encodeURIComponent(buildGitHubIssueBody(feedback));
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?title=${title}&body=${body}&labels=feedback`;
}

/**
 * Returns a JSON block that can be piped to `gh issue create` CLI.
 */
export function buildGitHubCliCommand(feedback: FeedbackForIssue): string {
  const title = `[Flock Feedback] ${feedback.message.slice(0, 80)}${feedback.message.length > 80 ? '...' : ''}`;
  const body = buildGitHubIssueBody(feedback);

  return [
    `gh issue create \\`,
    `  --repo "${REPO_OWNER}/${REPO_NAME}" \\`,
    `  --title "${title.replace(/"/g, '\\"')}" \\`,
    `  --label "feedback" \\`,
    `  --body '${body.replace(/'/g, "'\\''")}'`,
  ].join('\n');
}
