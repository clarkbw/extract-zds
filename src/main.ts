import * as core from '@actions/core';
import {zeds} from './zeds';

export async function run(): Promise<void> {
  try {
    zeds();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
