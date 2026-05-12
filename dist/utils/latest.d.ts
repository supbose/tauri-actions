import { Release, ReleaseAsset } from '../types';
export declare function getSignatureForAsset(repoInfo: any, assetName: string, assets: ReleaseAsset[]): Promise<string>;
export declare function buildPlatformsFromAssets(release: Release, downloadUrl: string, localUploadDir?: string, repoInfo?: any): Promise<{
    [key: string]: {
        url: string;
        signature: string;
    };
}>;
export declare function updateAndUploadLatestJson(release: Release, targetVersion: string, localUploadDir: string | undefined, repoInfo: any, cdnBase: string): Promise<void>;
//# sourceMappingURL=latest.d.ts.map