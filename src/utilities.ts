#! /usr/bin/env node

import type { PackageJson } from 'types-package-json';

import { readFile } from 'fs/promises';
import { join } from 'path';
import satisfies from 'semver/functions/satisfies';

export const rootPackage: (cwd: string) => Promise<void | PackageJson> = async (
    cwd = process.cwd()
) => parsePackageJson(join(cwd, 'package.json'));

export function getMax<K>(key: keyof K, array: K[]) {
    return array
        .map(a => a[key])
        .reduce(
            (max, value) => Math.max(max, (value as unknown as string).length),
            0
        );
}

export const upgradeColor = (from: string, to: string): string => {
    if (!satisfies(from, to)) return 'red';
    return 'yellow';
};

export async function parsePackageJson(
    filepath: string
): Promise<PackageJson | void> {
    let content;

    try {
        content = await readFile(filepath, 'utf-8');
    } catch (error) {
        console.log(error);
        return;
    }

    return JSON.parse(content);
}

export const getRandomColor = (seed: string) => {
    const colors: import('chalk').Color[] = [
        'magenta',
        'magentaBright',
        'cyan',
        'cyanBright',
        'yellow',
        'yellowBright',
        'blueBright',
    ];
    const s: number = seed
        .split('')
        .map(s => s.charCodeAt(0))
        .reduce((prev: number, curr: number): number => prev + curr);
    const i = s % colors.length;
    return colors[i];
};
