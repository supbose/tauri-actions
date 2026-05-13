import * as fs from 'fs';
import * as path from 'path';
import { getPlatformKeys } from './platform';
import { getReleaseAssetContent, getGitCommitMessage } from './github';
import { getAllFiles } from './files';
import { uploadToFTP } from './ftp';
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
export async function buildPlatformsFromAssets(release, downloadUrl, localUploadDir, repoInfo) {
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
                    platforms[platformKey] = {
                        url: `${downloadUrl}/${fileName}`,
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
            for (const platformKey of platformKeys) {
                platforms[platformKey] = {
                    url: `${downloadUrl}/${asset.name}`,
                    signature: signature
                };
            }
        }
    }
    return platforms;
}
export async function updateAndUploadLatestJson(release, targetVersion, localUploadDir, repoInfo, cdnBase, ftpConfig) {
    try {
        console.log('Updating latest.json...');
        const normalizedCdnBase = cdnBase.endsWith('/') ? cdnBase : cdnBase + '/';
        const latestJsonAsset = release.assets.find(a => a.name === 'latest.json');
        let outputContent = '';
        if (!latestJsonAsset) {
            console.log('latest.json asset not found, creating a new one');
            const downloadUrl = `${normalizedCdnBase}download/v${targetVersion}`;
            const platforms = await buildPlatformsFromAssets(release, downloadUrl, localUploadDir, repoInfo);
            const defaultLatestJson = {
                version: targetVersion,
                notes: await getGitCommitMessage(repoInfo),
                pub_date: new Date().toISOString(),
                platforms: platforms
            };
            outputContent = JSON.stringify(defaultLatestJson, null, 2);
        }
        else {
            console.log('Found existing latest.json asset, updating CDN URL');
            try {
                const contentStr = await getReleaseAssetContent(repoInfo, latestJsonAsset);
                console.log(`latest.json content (first 500 chars): ${contentStr.substring(0, 500)}`);
                let contentJson;
                try {
                    contentJson = JSON.parse(contentStr);
                }
                catch (parseError) {
                    console.warn('Failed to parse latest.json as JSON, creating new one:', parseError);
                    contentJson = {
                        version: targetVersion,
                        notes: '',
                        platforms: {}
                    };
                }
                const version = contentJson.version || targetVersion;
                console.log('Version:', version);
                const downloadUrl = `${normalizedCdnBase}download/v${version}`;
                if (contentJson.platforms) {
                    for (const [platformKey, platformData] of Object.entries(contentJson.platforms)) {
                        const data = platformData;
                        const fileName = path.basename(data.url || '');
                        contentJson.platforms[platformKey] = {
                            url: `${downloadUrl}/${fileName}`,
                            signature: data.signature || ''
                        };
                    }
                }
                outputContent = JSON.stringify(contentJson, null, 2);
            }
            catch (error) {
                console.error('Failed to update existing latest.json, creating new one:', error);
                const downloadUrl = `${normalizedCdnBase}download/v${targetVersion}`;
                const platforms = await buildPlatformsFromAssets(release, downloadUrl, localUploadDir, repoInfo);
                outputContent = JSON.stringify({
                    version: targetVersion,
                    notes: await getGitCommitMessage(repoInfo),
                    pub_date: new Date().toISOString(),
                    platforms: platforms
                }, null, 2);
            }
        }
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