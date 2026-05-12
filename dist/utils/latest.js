import * as fs from 'fs';
import * as path from 'path';
import { getPlatformKeys } from './platform';
import { getReleaseAssetContent, getGitCommitMessage } from './github';
import { getAllFiles } from './files';
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
export async function updateAndUploadLatestJson(release, targetVersion, localUploadDir, repoInfo, cdnBase) {
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
            const contentStr = await getReleaseAssetContent(repoInfo, latestJsonAsset);
            const contentJson = JSON.parse(contentStr);
            const version = contentJson.version || targetVersion;
            console.log('Version:', version);
            const downloadUrl = `${normalizedCdnBase}download/v${version}`;
            outputContent = contentStr.replace(/"url":\s*"[^"]+"/g, `"url": "${downloadUrl}/$&".replace(/"url":\s*"/, '').replace(/"$/, '')`);
        }
        const outputDir = './output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const latestJsonPath = path.join(outputDir, 'latest.json');
        fs.writeFileSync(latestJsonPath, outputContent, 'utf-8');
        console.log(`Latest.json written to: ${latestJsonPath}`);
        if (localUploadDir && fs.existsSync(localUploadDir)) {
            const uploadPath = path.join(localUploadDir, 'latest.json');
            fs.copyFileSync(latestJsonPath, uploadPath);
            console.log(`Latest.json copied to upload directory: ${uploadPath}`);
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