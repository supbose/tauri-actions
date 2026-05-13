import * as fs from 'fs';
import * as path from 'path';
import { Release, ReleaseAsset, LatestJsonContent, FtpConfig } from '../types';
import { getPlatformKeys } from './platform';
import { getReleaseAssetContent, getGitCommitMessage } from './github';
import { getAllFiles } from './files';
import { uploadToFTP } from './ftp';

/**
 * Get signature content for an asset from release assets
 * @param repoInfo - Repository info
 * @param assetName - Asset file name
 * @param assets - Release assets array
 * @returns Signature content or empty string
 */
export async function getSignatureForAsset(repoInfo: any, assetName: string, assets: ReleaseAsset[]): Promise<string> {
  const sigAsset = assets.find(a => a.name === assetName + '.sig');
  if (sigAsset) {
    try {
      const signatureContent = await getReleaseAssetContent(repoInfo, sigAsset);
      console.log(`Loaded signature for ${assetName}: ${signatureContent.substring(0, 50)}...`);
      return signatureContent.trim();
    } catch (error) {
      console.error(`Failed to load signature for ${assetName}.sig:`, error);
    }
  }
  return '';
}

/**
 * Build platforms object from release assets and local files
 * @param release - Release data
 * @param downloadUrl - Base download URL
 * @param localUploadDir - Local directory containing uploaded files
 * @param repoInfo - Repository info
 * @returns Platforms object
 */
export async function buildPlatformsFromAssets(
  release: Release,
  downloadUrl: string,
  localUploadDir?: string,
  repoInfo?: any
): Promise<{ [key: string]: { url: string; signature: string } }> {
  const platforms: { [key: string]: { url: string; signature: string } } = {};

  // First try to get platforms from local directory
  if (localUploadDir && fs.existsSync(localUploadDir)) {
    console.log('Using local upload directory:', localUploadDir);

    const localFiles = getAllFiles(localUploadDir);
    for (const filePath of localFiles) {
      const fileName = path.basename(filePath);
      if (fileName === 'latest.json' || fileName.endsWith('.sig')) continue;

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
    if (asset.name === 'latest.json' || asset.name.endsWith('.sig')) continue;

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

/**
 * Update latest.json with CDN URL and upload to FTP
 * @param release - Release data
 * @param targetVersion - Target version
 * @param localUploadDir - Local directory containing uploaded files
 * @param repoInfo - Repository info
 * @param cdnBase - CDN base URL
 * @param ftpConfig - FTP configuration for uploading latest.json to updater directory
 */
export async function updateAndUploadLatestJson(
  release: Release,
  targetVersion: string,
  localUploadDir: string | undefined,
  repoInfo: any,
  cdnBase: string,
  ftpConfig: FtpConfig | undefined
): Promise<void> {
  try {
    console.log('Updating latest.json...');
    
    const normalizedCdnBase = cdnBase.endsWith('/') ? cdnBase : cdnBase + '/';
    
    // Find latest.json asset
    const latestJsonAsset = release.assets.find(a => a.name === 'latest.json');
    
    let outputContent = '';

    if (!latestJsonAsset) {
      console.log('latest.json asset not found, creating a new one');
      const downloadUrl = `${normalizedCdnBase}download/v${targetVersion}`;
      const platforms = await buildPlatformsFromAssets(release, downloadUrl, localUploadDir, repoInfo);
      
      const defaultLatestJson: LatestJsonContent = {
        version: targetVersion,
        notes: await getGitCommitMessage(repoInfo),
        pub_date: new Date().toISOString(),
        platforms: platforms
      };
      
      outputContent = JSON.stringify(defaultLatestJson, null, 2);
    } else {
      console.log('Found existing latest.json asset, updating CDN URL');
      try {
        const contentStr = await getReleaseAssetContent(repoInfo, latestJsonAsset);
        console.log(`latest.json content (first 500 chars): ${contentStr.substring(0, 500)}`);
        
        let contentJson: LatestJsonContent;
        try {
          contentJson = JSON.parse(contentStr);
        } catch (parseError) {
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
        
        // Update all platform URLs
        if (contentJson.platforms) {
          for (const [platformKey, platformData] of Object.entries(contentJson.platforms)) {
            const data = platformData as { url?: string; signature?: string };
            const fileName = path.basename(data.url || '');
            contentJson.platforms[platformKey] = {
              url: `${downloadUrl}/${fileName}`,
              signature: data.signature || ''
            };
          }
        }
        
        outputContent = JSON.stringify(contentJson, null, 2);
      } catch (error) {
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

    // Write to local file
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const latestJsonPath = path.join(outputDir, 'latest.json');
    fs.writeFileSync(latestJsonPath, outputContent, 'utf-8');
    console.log(`Latest.json written to: ${latestJsonPath}`);
    
    // Upload latest.json to updater directory via FTP
    if (ftpConfig) {
      console.log(`Uploading latest.json to FTP server: ${ftpConfig.host}`);
      console.log(`Server directory: updater/`);
      
      const updaterFtpConfig: FtpConfig = {
        ...ftpConfig,
        serverDir: 'updater/'
      };
      
      // Create a temporary directory just for latest.json
      const updaterDir = './output/updater';
      if (!fs.existsSync(updaterDir)) {
        fs.mkdirSync(updaterDir, { recursive: true });
      }
      
      const updaterLatestJsonPath = path.join(updaterDir, 'latest.json');
      fs.copyFileSync(latestJsonPath, updaterLatestJsonPath);
      
      const uploadResult = await uploadToFTP(updaterDir, updaterFtpConfig);
      if (uploadResult.success) {
        console.log('✅ latest.json uploaded to updater directory successfully');
      } else {
        console.error('❌ Failed to upload latest.json:', uploadResult.message);
      }
    }
    
    // Print the URL
    const latestJsonUrl = `${normalizedCdnBase}updater/latest.json`;
    console.log('🚀 Latest.json URL:', latestJsonUrl);
    
  } catch (error) {
    console.error('Error updating and uploading latest.json:', error);
    throw error;
  }
}