declare module 'latest-package' {
    export interface PackageUpdates {
        parent: string;
        packageName: string;
        to: string;
        depType: import('types-package-json').PackageJsonDependencyTypes;
        from: string;
        path: string;
    }

    export type Versions = Map<string, string | import('semver').SemVer>;

    export type PackageMetadata = {
        packageName: string;
        version: string;
    };

    export type UpdateDependencyReturns = {
        update: boolean;
        target: string;
        current: string;
        versions: Versions;
    };

    export interface LatestPackageConfig {
        cwd?: string;
        scope?: (string | number)[];
        include?: string[];
        exclude?: string[];
        check?: boolean;
        verbose?: boolean;
        yes?: boolean;
        install?: string;
        depTypes?: string[];
    }

    export default (scopes: string[], include: string[], exclude: string[]) =>
        Promise<void>;
}
