#! /usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import type { LatestPackageConfig } from 'latest-package';

import { rootPackage } from './utilities';

export const {
    cwd = process.cwd(),
    scope = [],
    include,
    exclude = [],
    depTypes = ['dependencies', 'devDependencies'],
    install,
    yes = false,
    verbose,
    check,
}: LatestPackageConfig = await yargs(hideBin(process.argv))
    .options({
        cwd: {
            type: 'string',
            default: process.cwd(),
        },
        scope: {
            description:
                'Packages or scope(s); focuses updates to only packages specified.',
            array: true,
        },
        include: {
            description:
                'Workspaces to include in the updates. Array and/or globs accepted.',
            array: true,
            default: [
                '.',
                ...((await rootPackage(process.cwd())) as any)?.workspaces,
            ] || [`**`],
        },
        exclude: {
            description:
                'Workspaces to exclude from any updates. Array and/or globs accepted.',
            array: true,
            default: [],
        },
        check: {
            description: 'Check for updates without installing.',
            boolean: true,
            default: false,
        },
        verbose: {
            alias: 'v',
            description: 'Verbose output.',
            boolean: true,
            default: false,
        },
        yes: {
            description: 'Answer yes to all upgrade prompts.',
            boolean: true,
            conflicts: ['check'],
        },
        install: {
            description:
                'Install command to use after making the necessary package updates.',
            string: true,
            default: 'yarn install',
        },
        depTypes: {
            description: 'Limit the types of dependencies to update.',
            array: true,
            default: ['dependencies', 'devDependencies'],
        },
    })
    .help().argv;
