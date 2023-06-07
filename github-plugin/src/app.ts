import { config } from 'dotenv';
config();

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { addComment, updateCustomField } from './jira'; // Import the Jira module


const app = express();
const port = 3020;
const JIRA_USERNAME = process.env.JIRA_USERNAME!;
const JIRA_API_TOKEN = process.env.JIRA_TOKEN!;

if (!JIRA_USERNAME || !JIRA_API_TOKEN) {
    console.error("Error: Required environment variables JIRA_USERNAME or JIRA_TOKEN not set");
    process.exit(1);
}

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.post('/webhook', async (req: Request, res: Response) => {
  console.log('Received a post request');

  // Extract the PR, commit, and issue details from the webhook payload
  const pr = req.body.pull_request;
  const commit = req.body.commit;
  const issue = req.body.issue;

  if (pr) {
    console.log('PR details:', pr);
    await handlePullRequest(pr);
  } else if (commit) {
    console.log('Commit details:', commit);
    await handleCommit(commit);
  } else if (issue) {
    console.log('Issue details:', issue);
    await handleIssue(issue);
  } else {
    console.log('No pull_request, commit, or issue field in payload');
  }

  res.sendStatus(200);
});

async function handlePullRequest(pr: any) {
  // Extract Jira issue key from PR title
  const issueKey = extractIssueKey(pr.title);

  // Create PR info
  const prInfo = createPRInfo(pr);

  if (issueKey) {
    // Add a comment to Jira
    await addComment(issueKey, JSON.stringify(prInfo), { username: JIRA_USERNAME, password: JIRA_API_TOKEN });
  }
}

async function handleCommit(commit: any) {
  // Assuming commit message has Jira issue key
  const issueKey = extractIssueKey(commit.message);

  // Create commit info
  const commitInfo = createCommitInfo(commit);

  if (issueKey) {
    // Add a comment to Jira
    await addComment(issueKey, JSON.stringify(commitInfo), { username: JIRA_USERNAME, password: JIRA_API_TOKEN });
  }
}

async function handleIssue(issue: any) {
  // Assuming issue title has Jira issue key
  const issueKey = extractIssueKey(issue.title);

  // Create issue info
  const issueInfo = createIssueInfo(issue);

  if (issueKey) {
    // Add a comment to Jira
    await addComment(issueKey, JSON.stringify(issueInfo), { username: JIRA_USERNAME, password: JIRA_API_TOKEN });
  }
}

function extractIssueKey(title: string): string {
  // Assuming your PR titles, commit messages, and issue titles are in the format of 'JIRA-123 Some title'
  return title.split(' ')[0];
}

function createPRInfo(pr: any): any {
  return {
    url: pr.url,
    id: pr.id,
    node_id: pr.node_id,
    number: pr.number,
    state: pr.state,
    locked: pr.locked,
    title: pr.title,
    body: pr.body,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    closed_at: pr.closed_at,
    merged_at: pr.merged_at,
  };
}

function createCommitInfo(commit: any): any {
  return {
    id: commit.id,
    message: commit.message,
    url: commit.url,
    comment_count: commit.comment_count,
  };
}

function createIssueInfo(issue: any): any {
    return {
      id: issue.id,
      node_id: issue.node_id,
      url: issue.url,
      title: issue.title,
      body: issue.body,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      closed_at: issue.closed_at,
      state: issue.state,
      comments: issue.comments,
    };
}
  
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});