#! /usr/bin/env node

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { exit } from 'process';

import util from 'util';
import { exec as execCallback } from 'child_process';
const exec = util.promisify(execCallback);

import prettier from 'prettier';
import { format } from 'prettier-package-json';

import semver from 'semver';
import fg from 'fast-glob';
import inquirer from 'inquirer';
import chalk from 'chalk';

import type { PackageUpdates, Versions } from 'latest-package';
import type { PackageJsonDependencyTypes } from 'types-package-json';

import { depTypes, install, yes, verbose, check } from './cli';
import {
    parsePackageJson,
    getMax,
    getRandomColor,
    upgradeColor,
} from './utilities';
import getLatest from './get-latest';

export default async function update(
    scopes: string[] = [],
    include: string[] = [`** /package.json`],
    exclude: string[] = []
): Promise<void> {
    // Capture if any updates are required & run the install once at the end
    const updating: PackageUpdates[] = [];

    // Capture the versions to prevent repeated semver checks
    let versions: Versions = new Map();

    // Read in the package.json assets in the repo (excluding node_modules)
    if (verbose) {
        console.log(
            `Include packages: ${chalk.gray(
                include.map(i => join(i, 'package.json')).join(', ')
            )}`
        );
        console.log(`Checking scopes: ${chalk.gray(scopes.join(', '))}`);
        console.log(
            `Checking dependency types: ${chalk.gray(
                ['dependencies', 'devDependencies'].join(', ')
            )}`
        );
        console.log();
    }

    // Iterate over the supported packages
    for (const packageJSONPath of await fg(
        include.map(i => join(i, 'package.json')),
        {
            ignore: ['**/node_modules/**', ...exclude],
        }
    )) {
        // Read in the package data as an object
        let packageJSON = await parsePackageJson(packageJSONPath);
        if (!packageJSON) continue;

        const pkgColor = getRandomColor(
            packageJSON.name.split('/').pop() || packageJSON.name
        );
        const label = (chalk as any)[pkgColor](packageJSON.name);

        // Iterate over the dependency types in the package
        for (const depType of depTypes) {
            const deps = packageJSON[depType as PackageJsonDependencyTypes];
            // If there are no dependencies of this type, skip the rest in the loop
            if (!deps) continue;

            // Iterate over the found packages of this type
            for (const [packageName, version] of Object.entries(deps)) {
                if (
                    scopes.length &&
                    !scopes.some(scope => packageName.startsWith(scope))
                ) {
                    continue;
                }

                let target;
                if (!versions.has(packageName)) {
                    target = await getLatest({ packageName, version });
                    if (!target) continue;

                    if (target && target !== version) {
                        versions.set(packageName, target);
                    }
                } else {
                    target = versions.get(packageName);
                    if (!target) continue;
                }

                if (semver.gt(target, version)) {
                    updating.push({
                        parent: label,
                        packageName,
                        to: target.toString(),
                        depType: depType as PackageJsonDependencyTypes,
                        from: version,
                        path: packageJSONPath,
                    });
                }
            }
        }
    }

    if (updating.length) {
        const printUpdates = (
            { parent, packageName, to, depType, from }: PackageUpdates,
            array: PackageUpdates[]
        ) =>
            `${parent.padEnd(
                getMax<PackageUpdates>('parent', array) + 2
            )}${packageName.padEnd(
                getMax<PackageUpdates>('packageName', array) + 2
            )}${from.padStart(getMax<PackageUpdates>('from', array))} -> ${(
                chalk as any
            )[upgradeColor(from, to)](
                to.padEnd(getMax<PackageUpdates>('to', array) + 2)
            )} ${chalk.grey(depType)}`;

        if (!check) {
            let packagesToUpdate = updating;

            if (!yes) {
                const answers = await inquirer.prompt([
                    {
                        name: 'packagesToUpdate',
                        type: 'checkbox',
                        message: '\nSelect the packages you want to update:',
                        choices: updating.map((metadata, _idx, array) => {
                            return {
                                name: printUpdates(metadata, array),
                                value: metadata,
                            };
                        }),
                    },
                ]);

                packagesToUpdate = answers.packagesToUpdate;
            }

            if (!packagesToUpdate || !packagesToUpdate.length) exit(0);

            for (const { path, packageName, to, depType } of packagesToUpdate) {
                const packageJSON: any = await parsePackageJson(path);
                if (!packageJSON) continue;

                // Update the package.json with the new version
                packageJSON[depType][packageName] = to;

                // Write the changes to the package.json
                const config: prettier.Options =
                    (await prettier.resolveConfig(path)) || {};
                const content = format(packageJSON as any, { ...config });
                await writeFile(path, content);
            }

            if (install) {
                const { stdout } = await exec(install);
                if (stdout) console.log(stdout);
            }
        } else {
            console.log(`The following packages can be updated:\n`);
            for (const metadata of updating) {
                console.log(`  ${printUpdates(metadata, updating)}`);
            }
        }
    } else {
        console.log('\nAll dependencies are on their latest version 😎');
    }

    exit(0);
}
