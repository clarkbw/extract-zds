import nock from 'nock';
import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';

import * as issue from './issue.json';
import * as comments from './comments.json';

process.env['INPUT_TOKEN'] = 'TOKEN';
process.env['GITHUB_REPOSITORY'] = 'github/c2c-packages';
process.env['GITHUB_EVENT_PATH'] = path.join(__dirname, 'payload.json');

import {zeds} from '../src/zeds';

// jest.doMock('@actions/github', () => {
//   return {
//     GitHub: (token: string) => {
//       console.log(`token: ${token}`);
//       return {
//         issues: {
//           get: jest.fn(() => issue),
//           listComments: jest.fn(() => comments)
//         }
//       };
//     }
//   };
// });

test('run main', async () => {
  nock.disableNetConnect();
  nock('https://api.github.com:443')
    .get('/repos/github/c2c-packages/issues/12345')
    .reply(200, issue);

  nock('https://api.github.com:443')
    .get('/repos/github/c2c-packages/issues/12345/comments')
    .reply(200, comments);
  await zeds();
});

// // shows how the runner will run a javascript action with env / stdout protocol
// test('test runs', () => {
//   const ip = path.join(__dirname, '..', 'lib', 'main.js');
//   const options: cp.ExecSyncOptions = {
//     env: process.env
//   };
//   console.log(cp.execSync(`node ${ip}`, options).toString());
// });
