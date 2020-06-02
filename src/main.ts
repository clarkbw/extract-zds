import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true});

    const octokit = new github.GitHub(token);
    const context = github.context;

    const filterBodies = (issue: any) => issue.body.includes('ZD-');
    const mapZeds = (issue: any) => issue.body.match(/ZD-(\d+)/g);

    const issue = await octokit.issues
      .get({
        ...context.repo,
        issue_number: context.issue.number
      })
      .then(result => mapZeds(result.data));

    const comments = await octokit.issues
      .listComments({
        ...context.repo,
        issue_number: context.issue.number
      })
      .then(result => result.data.filter(filterBodies).map(mapZeds));

    const zeds = issue.concat(comments);

    core.setOutput('zeds', JSON.stringify(zeds));
    core.setOutput('issue', `${context.issue.number}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
