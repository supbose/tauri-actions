import * as fs from 'fs';
import * as path from 'path';
import { getPlatformKeys } from './platform';
import { getReleaseAssetContent, getGitCommitMessage } from './github';
import { getAllFiles } from './files';
import { uploadToFTP } from './ftp';
import { formatDateTimeWithTimezone, ensureTrailingSlash } from './utils';
export async function getSignatureForAsset(repoInfo, assetName, assets) {
    const sigAsset = assets.find(a => a.name === assetName + '.sig');
    if (sigAsset) {
        try {
            const signatureContent = await getReleaseAssetContent(repoInfo, sigAsset);
            console.log(`Loaded signature for ${assetName}: ${signatureContent.substring(0, 50)}...`);
            return signatureContent.trim();
        }
        catch (error) {
            console.error(`Failed to load signature for ${assetName}.sig:`, error);
        }
    }
    return '';
}
function getOSDirectory(platformKey) {
    if (platformKey.startsWith('windows')) {
        return 'windows';
    }
    else if (platformKey.startsWith('darwin')) {
        return 'macos';
    }
    else {
        return 'linux';
    }
}
export async function buildPlatformsFromAssets(release, cdnBase, targetVersion, localUploadDir, repoInfo, serverDir = '') {
    const platforms = {};
    if (localUploadDir && fs.existsSync(localUploadDir)) {
        console.log('Using local upload directory:', localUploadDir);
        const localFiles = getAllFiles(localUploadDir);
        for (const filePath of localFiles) {
            const fileName = path.basename(filePath);
            if (fileName === 'latest.json' || fileName.endsWith('.sig'))
                continue;
            const platformKeys = getPlatformKeys(fileName);
            if (platformKeys.length > 0) {
                const sigFilePath = path.join(localUploadDir, fileName + '.sig');
                const signature = fs.existsSync(sigFilePath)
                    ? fs.readFileSync(sigFilePath, 'utf-8').trim()
                    : '';
                for (const platformKey of platformKeys) {
                    const osDir = getOSDirectory(platformKey);
                    const serverPath = serverDir ? serverDir.replace(/\/$/, '') : '';
                    const basePath = serverPath ? `${serverPath}/${osDir}/v${targetVersion}/` : `${osDir}/v${targetVersion}/`;
                    platforms[platformKey] = {
                        url: `${cdnBase}${basePath}${fileName}`,
                        signature: signature
                    };
                    console.log(`Added local file: ${fileName} -> ${platformKey}`);
                }
            }
        }
        if (Object.keys(platforms).length > 0) {
            console.log(`Found ${Object.keys(platforms).length} platform(s) from local directory`);
            return platforms;
        }
        console.log('No platforms found in local directory, falling back to online assets');
    }
    if (!repoInfo) {
        console.log('No repository info provided, cannot fetch online assets');
        return platforms;
    }
    for (const asset of release.assets) {
        if (asset.name === 'latest.json' || asset.name.endsWith('.sig'))
            continue;
        const platformKeys = getPlatformKeys(asset.name);
        if (platformKeys.length > 0) {
            const signature = await getSignatureForAsset(repoInfo, asset.name, release.assets);
            const serverPath = serverDir ? serverDir.replace(/\/$/, '') : '';
            for (const platformKey of platformKeys) {
                const osDir = getOSDirectory(platformKey);
                const basePath = serverPath ? `${serverPath}/${osDir}/v${targetVersion}/` : `${osDir}/v${targetVersion}/`;
                platforms[platformKey] = {
                    url: `${cdnBase}${basePath}${asset.name}`,
                    signature: signature
                };
            }
        }
    }
    return platforms;
}
export async function updateAndUploadLatestJson(release, targetVersion, localUploadDir, repoInfo, cdnBase, ftpConfig, timezone = 'Asia/Shanghai') {
    try {
        console.log('Updating latest.json...');
        const normalizedCdnBase = ensureTrailingSlash(cdnBase);
        console.log('Generating new latest.json...');
        const serverDir = ftpConfig?.serverDir || '';
        const platforms = await buildPlatformsFromAssets(release, normalizedCdnBase, targetVersion, localUploadDir, repoInfo, serverDir);
        console.log(`Using timezone: ${timezone}`);
        const pubDate = formatDateTimeWithTimezone(new Date(), timezone);
        const defaultLatestJson = {
            version: targetVersion,
            notes: await getGitCommitMessage(repoInfo),
            pub_date: pubDate,
            platforms: platforms
        };
        const outputContent = JSON.stringify(defaultLatestJson, null, 2);
        const outputDir = './output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const latestJsonPath = path.join(outputDir, 'latest.json');
        fs.writeFileSync(latestJsonPath, outputContent, 'utf-8');
        console.log(`Latest.json written to: ${latestJsonPath}`);
        if (ftpConfig) {
            console.log(`Uploading latest.json to FTP server: ${ftpConfig.host}`);
            console.log(`Server directory: updater/`);
            const updaterFtpConfig = {
                ...ftpConfig,
                serverDir: 'updater/'
            };
            const updaterDir = './output/updater';
            if (!fs.existsSync(updaterDir)) {
                fs.mkdirSync(updaterDir, { recursive: true });
            }
            const updaterLatestJsonPath = path.join(updaterDir, 'latest.json');
            fs.copyFileSync(latestJsonPath, updaterLatestJsonPath);
            const uploadResult = await uploadToFTP(updaterDir, updaterFtpConfig);
            if (uploadResult.success) {
                console.log('✅ latest.json uploaded to updater directory successfully');
            }
            else {
                console.error('❌ Failed to upload latest.json:', uploadResult.message);
            }
        }
        const latestJsonUrl = `${normalizedCdnBase}updater/latest.json`;
        console.log('🚀 Latest.json URL:', latestJsonUrl);
    }
    catch (error) {
        console.error('Error updating and uploading latest.json:', error);
        throw error;
    }
}
//# sourceMappingURL=latest.js.map