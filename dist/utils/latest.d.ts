import { Release, FtpConfig } from '../types';
export declare function buildPlatformsFromAssets(release: Release, cdnBase: string, targetVersion: string, localUploadDir?: string, repoInfo?: any, serverDir?: string): Promise<{
    [key: string]: {
        url: string;
        signature: string;
    };
}>;
export declare function updateAndUploadLatestJson(release: Release, targetVersion: string, localUploadDir: string | undefined, repoInfo: any, cdnBase: string, ftpConfig: FtpConfig | undefined, timezone?: string): Promise<void>;
//# sourceMappingURL=latest.d.ts.map