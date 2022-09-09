#! /usr/bin/env node

import { exit } from 'process';

import { cwd, scope, include, exclude } from './cli';
import { rootPackage } from './utilities';
import update from './update';

if (!(await rootPackage(cwd))) {
    console.log('Could not find root package.json');
    exit(0);
}

update(scope as string[], include, exclude);
