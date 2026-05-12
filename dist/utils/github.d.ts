import { RepositoryInfo, Release, ReleaseAsset } from '../types';
export declare function initializeToken(): void;
export declare function getRepositoryInfo(): RepositoryInfo;
export declare function getReleaseByTag(repoInfo: RepositoryInfo, tagName: string): Promise<Release | undefined>;
export declare function getLatestRelease(repoInfo: RepositoryInfo): Promise<Release | undefined>;
export declare function getReleaseAssetContent(repoInfo: RepositoryInfo, asset: ReleaseAsset): Promise<string>;
export declare function getGitCommitMessage(repoInfo: RepositoryInfo): Promise<string>;
//# sourceMappingURL=github.d.ts.map