import * as fs from 'fs';
import * as path from 'path';
import { Release, LatestJsonContent, FtpConfig } from '../types';
import { getPlatformKeys } from './platform';
import { getGitCommitMessage } from './github';
import { getAllFiles } from './files';
import { uploadToFTP } from './ftp';
import { getISOWithTimeZone, getAutoOS, ensureTrailingSlash, joinUrl, getLocalSignature } from './utils';

/**
 * Get OS directory prefix based on platform key
 * @param platformKey - Platform key (e.g., windows-x86_64, darwin-x86_64)
 * @returns OS directory prefix (windows, macos, linux)
 */
function getOSDirectory(platformKey: string): string {
  if (platformKey.startsWith('windows')) {
    return 'windows';
  } else if (platformKey.startsWith('darwin')) {
    return 'macos';
  } else {
    return 'linux';
  }
}

/**
 * Build platforms object from release assets and local files
 * @param release - Release data
 * @param cdnBase - CDN base URL
 * @param targetVersion - Target version
 * @param localUploadDir - Local directory containing uploaded files
 * @param repoInfo - Repository info
 * @param serverDir - FTP server directory prefix
 * @returns Platforms object
 */
export async function buildPlatformsFromAssets(
  release: Release,
  cdnBase: string,
  targetVersion: string,
  localUploadDir?: string,
  repoInfo?: any,
  serverDir: string = ''
): Promise<{ [key: string]: { url: string; signature: string } }> {
  const platforms: { [key: string]: { url: string; signature: string } } = {};

  // First try to get platforms from local directory
  if (localUploadDir && fs.existsSync(localUploadDir)) {
    console.log('Using local upload directory:', localUploadDir);

    const localFiles = getAllFiles(localUploadDir);
    for (const filePath of localFiles) {
      const fileName = path.basename(filePath);
      if (fileName === 'latest.json' || fileName.toLowerCase().endsWith('.sig')) continue;

      const platformKeys = getPlatformKeys(fileName);
      if (platformKeys.length > 0) {
        const signature = getLocalSignature(localUploadDir, fileName);

        for (const platformKey of platformKeys) {
          const osDir = getOSDirectory(platformKey);
          platforms[platformKey] = {
            url: joinUrl(cdnBase, serverDir, osDir, `v${targetVersion}`, fileName),
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

  // 如果没有本地文件，从在线资产获取平台信息
  // 但签名仍然从本地目录读取
  for (const asset of release.assets) {
    if (asset.name === 'latest.json' || asset.name.toLowerCase().endsWith('.sig')) continue;

    const platformKeys = getPlatformKeys(asset.name);
    if (platformKeys.length > 0) {
      const signature = getLocalSignature(localUploadDir, asset.name);
      
      for (const platformKey of platformKeys) {
        const osDir = getOSDirectory(platformKey);
        platforms[platformKey] = {
          url: joinUrl(cdnBase, serverDir, osDir, `v${targetVersion}`, asset.name),
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
 * @param timezone - Timezone for pub_date (default: Asia/Shanghai)
 */
export async function updateAndUploadLatestJson(
  release: Release,
  targetVersion: string,
  localUploadDir: string | undefined,
  repoInfo: any,
  cdnBase: string,
  ftpConfig: FtpConfig | undefined,
  timezone: string = 'Asia/Shanghai'
): Promise<void> {
  try {
    console.log('Updating latest.json...');
    
    const normalizedCdnBase = ensureTrailingSlash(cdnBase);
    
    // Directly generate latest.json without fetching from online
    console.log('Generating new latest.json...');
    const serverDir = ftpConfig?.serverDir || '';
    const platforms = await buildPlatformsFromAssets(release, normalizedCdnBase, targetVersion, localUploadDir, repoInfo, serverDir);
    
    console.log(`Using timezone: ${timezone}`);
    const pubDate = getISOWithTimeZone(new Date(), timezone);
    
    const defaultLatestJson: LatestJsonContent = {
      version: targetVersion,
      notes: await getGitCommitMessage(repoInfo),
      pub_date: pubDate,
      platforms: platforms
    };
    
    const outputContent = JSON.stringify(defaultLatestJson, null, 2);

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
      const os = getAutoOS();
      
      const updaterFtpConfig: FtpConfig = {
        ...ftpConfig,
        serverDir: `updater/${os}/`
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