import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const jiraBaseURL = process.env.JIRA_BASE_URL;

interface JiraCredentials {
  username: string;
  password: string;
}

// Method to add a comment to an issue
export async function addComment(issueKey: string, commentBody: string, credentials: JiraCredentials): Promise<void> {
    const options = {
        method: 'POST',
        url: `${jiraBaseURL}/rest/api/2/issue/${issueKey}/comment`,
        auth: credentials,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: {
            body: commentBody
        }
    };
    await axios(options);
    console.log(`Comment added to issue ${issueKey}`);
}

// Method to update custom field of an issue
export async function updateCustomField(issueKey: string, customFieldValue: any, customFieldId: string, credentials: JiraCredentials): Promise<void> {
    const options = {
        method: 'PUT',
        url: `${jiraBaseURL}/rest/api/2/issue/${issueKey}`,
        auth: credentials,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: {
            "fields": {
                [customFieldId]: customFieldValue
            }
        }
    };
    await axios(options);
    console.log(`Custom field ${customFieldId} updated for issue ${issueKey}`);
}
