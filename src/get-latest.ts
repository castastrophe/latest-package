#! /usr/bin/env node

import latestVersion from 'latest-version';
import semver from 'semver';

import type { PackageMetadata } from 'latest-package';

export default async function getLatest({
    packageName,
    version,
}: PackageMetadata): Promise<void | string | semver.SemVer> {
    if (!packageName) return;

    let connectionErr = false;
    let target = await latestVersion(packageName).catch(() => {
        connectionErr = true;
        console.warn(
            `  ${packageName}  ⚠️  Issue fetching latest version. Check your internet connection.`
        );
    });

    if (!target && !connectionErr) {
        console.warn(` ${packageName}  ⚠️  Could not find latest version.`);
    }

    if (!target) return;

    const current = semver.coerce(version);

    if (!current) {
        console.warn(
            `  ${packageName}  ⚠️ Issue capturing the current version.`
        );
        return;
    }

    if (!semver.valid(current) || !semver.valid(target)) {
        console.warn(`  ${packageName}  ⚠️ Invalid versioning`, {
            current,
            target,
        });
        return;
    }

    // If the latest version is newer than the current version, update the dependency
    // otherwise, add the package data to the map but don't trigger an update
    return semver.gt(target, current) ? target : current;
}
