import * as core from '@actions/core';
import * as github from '@actions/github';

export async function zeds(): Promise<void> {
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
      .then(result => {
        console.log('RESULT', result);
        console.log('DATA', result.data);
        return mapZeds(result.data);
      });

    const comments = await octokit.issues
      .listComments({
        ...context.repo,
        issue_number: context.issue.number
      })
      .then(result => {
        console.log('RESULT', result);
        console.log('DATA', result.data);
        console.log('FIRST', result.data[0]);
        return result.data.filter(filterBodies).map(mapZeds);
      });

    const zeds = issue.concat(comments);
    console.log('ZEDS', zeds);
    
    core.setOutput('zeds', JSON.stringify(zeds));
    core.setOutput('issue', `${context.issue.number}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
