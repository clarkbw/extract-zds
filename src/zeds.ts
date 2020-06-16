import * as core from '@actions/core';
import * as github from '@actions/github';
import {type} from 'os';

// export const ZD_REGEX = /ZD-(\d+)|github\.zendesk\.com\/agent\/tickets\/(\d+)/;
export const ZD_REGEX = /ZD-(\d+)/g;
export const ZD_URL_REGEX = /github\.zendesk\.com\/agent\/tickets\/(\d+)/g;

export async function zeds(): Promise<void> {
  try {
    const context = github.context;
    const zeds = await query();
    console.log('ZEDS', zeds);

    core.setOutput('zeds', JSON.stringify(zeds));
    core.setOutput('length', `${zeds.length}`);
    core.setOutput('issue', `${context.issue.number}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function query(): Promise<Array<string>> {
  const token = core.getInput('token', {required: true});

  const octokit: github.GitHub = new github.GitHub(token);
  const context = github.context;
  let zeds = await bodies(octokit);

  return [
    ...new Set(
      zeds
        .map((issue: any) => {
          let matches: Array<string> = [];

          const shorthands = [...issue.matchAll(ZD_REGEX)];
          matches = matches.concat(shorthands.map((m: any) => m[0]));

          const urls = [...issue.matchAll(ZD_URL_REGEX)];
          matches = matches.concat(urls.map((m: any) => `ZD-${m[1]}`));

          return matches;
        })
        .flat()
    ).keys()
  ].sort();
}

export async function bodies(octokit: github.GitHub): Promise<Array<string>> {
  const context = github.context;

  const issue: Array<string> = await octokit.issues
    .get({
      ...context.repo,
      issue_number: context.issue.number
    })
    .then(result => [result.data.title, result.data.body]);

  const comments: Array<string> = await octokit.issues
    .listComments({
      ...context.repo,
      issue_number: context.issue.number
    })
    .then(result => result.data.map(i => i.body));

  return comments.concat(issue);
}
