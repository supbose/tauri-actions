/**
 * Main entry point for the up-actions GitHub Action
 * This action handles file deployment and version management
 */

import * as core from '@actions/core';
import 'dotenv/config';

// Import type definitions
import { ActionInputs, FtpConfig } from './types';

// Import utility modules
import { initializeToken, getRepositoryInfo, getLatestRelease } from './utils/github';
import { getVersionFromConfig } from './utils/version';
import { copyFiles, createDirectory, verifyFiles, formatPath, getAllFiles } from './utils/files';
import { uploadToFTP } from './utils/ftp';
import { updateAndUploadLatestJson } from './utils/latest';
import { validateInputs, sanitizeLogMessage } from './utils/validation';

/**
 * Upload latest version files
 * @param targetVersion - Version to upload
 * @param localUploadDir - Local directory containing uploaded files
 * @param ftpConfig - FTP configuration for uploading latest.json
 */
async function uploadLatestVersion(targetVersion: string, localUploadDir?: string, ftpConfig?: FtpConfig): Promise<void> {
  try {
    const repoInfo = getRepositoryInfo();
    const release = await getLatestRelease(repoInfo);
    
    if (!release) {
      console.log("No release found");
      return;
    }

    const cdnBaseUrl = core.getInput('cdn-base-url') || 'https://cdn.ali.yiruan.wang/';
    const timezone = core.getInput('timezone') || 'Asia/Shanghai';
    await updateAndUploadLatestJson(release, targetVersion, localUploadDir, repoInfo, cdnBaseUrl, ftpConfig, timezone);
  } catch (error) {
    console.error('Error uploading latest version:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function run(): Promise<void> {
  try {
    initializeToken();

    // Get input parameters
    const inputs: ActionInputs = {
      sourceDir: core.getInput('source-dir'),
      targetRoot: core.getInput('target-root'),
      configFile: core.getInput('config-file'),
      filterByVersion: core.getInput('filter-by-version') === 'true',
      enableFtp: core.getInput('enable-ftp') as 'disabled' | 'ci' | 'use',
      ftpHost: core.getInput('ftp-host'),
      ftpUsername: core.getInput('ftp-username'),
      ftpPassword: core.getInput('ftp-password'),
      ftpServerDir: core.getInput('ftp-server-dir'),
      uploadLatest: core.getInput('upload-latest') as 'disabled' | 'ci' | 'use',
      githubToken: core.getInput('github-token'),
      cdnBaseUrl: core.getInput('cdn-base-url'),
      timezone: core.getInput('timezone')
    };

    // Validate inputs
    const validation = validateInputs(inputs);
    if (!validation.valid) {
      core.setOutput('upload-latest', 'disabled');
      core.setFailed(`Input validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    // Get version from config file
    const version = getVersionFromConfig(inputs.configFile);
    console.log(`Using version: ${version}`);

    // Set output variables
    core.setOutput('version', version);
    core.setOutput('enable-ftp', inputs.enableFtp);

    // Create target directory
    const targetDir = `${inputs.targetRoot}/v${version}`;
    console.log(`Target directory: ${targetDir}`);

    // Save version to file for downstream steps
    const fs = await import('fs');
    try {
      fs.writeFileSync('version.txt', version, 'utf8');
    } catch (error) {
      console.log(`Warning: Failed to save version file:`, error);
    }

    // Create and verify target directory
    if (!createDirectory(targetDir)) {
      core.setFailed(`Failed to create target directory: ${targetDir}`);
      return;
    }
    core.setOutput('target-dir', targetDir);

    // Copy files from source to target (filter by version if enabled)
    const versionToFilter = inputs.filterByVersion ? version : undefined;
    const copyResult = copyFiles(inputs.sourceDir, targetDir, versionToFilter);
    if (!copyResult.success) {
      core.setFailed(`Failed to copy files`);
      return;
    }

    // Verify copied files
    verifyFiles(targetDir);

    // Handle upload-latest option
    if (inputs.uploadLatest === 'disabled') {
      console.log(`✅ Latest version upload is disabled`);
    } else if (inputs.uploadLatest === 'ci') {
      console.log("✅ Using plugin to trigger latest version upload");
    } else if (inputs.uploadLatest === 'use') {
      console.log(`✅ Using built-in FTP upload for latest version files`);
      if (inputs.githubToken) {
        console.log(`✅ GitHub Token: ${sanitizeLogMessage(inputs.githubToken)}`);
      }
    }

    // Handle FTP upload based on enable-ftp setting
    let ftpUploadSuccess = false;
    
    switch (inputs.enableFtp) {
      case 'disabled':
        console.log("FTP upload is disabled.");
        core.setOutput('ftp-upload-success', 'disabled');
        break;

      case 'ci':
        console.log("FTP upload enabled for external CI step.");
        core.setOutput('ftp-upload-success', 'external');
        break;

      case 'use':
        console.log("FTP upload enabled with built-in functionality...");

        // Create FTP config for latest.json upload
        const ftpConfig: FtpConfig = {
          host: inputs.ftpHost,
          user: inputs.ftpUsername,
          password: inputs.ftpPassword,
          serverDir: formatPath(inputs.ftpServerDir)
        };
        
        // If latest upload is enabled, generate latest.json first and upload to updater directory
        if (inputs.uploadLatest === 'use' && inputs.githubToken) {
          console.log(`✅ --------------------------------`);
          console.log(`✅ Generating latest.json before FTP upload`);
          console.log(`✅ GitHub Token: ${sanitizeLogMessage(inputs.githubToken)}`);
          console.log(`✅ --------------------------------`);
          
          try {
            await uploadLatestVersion(version, targetDir, ftpConfig);
            core.setOutput('latest-upload-success', 'true');
          } catch (error) {
            core.setOutput('latest-upload-success', 'false');
            console.error('Failed to generate latest version:', error);
          }
        }
        
        const uploadResult = await uploadToFTP(targetDir, {
          ...ftpConfig,
          serverDir: ftpConfig.serverDir + `v${version}/` || `download/v${version}/`
        });

        ftpUploadSuccess = uploadResult.success;
        core.setOutput('ftp-upload-success', ftpUploadSuccess.toString());
        break;

      default:
        core.setFailed(`Invalid enable-ftp value: ${inputs.enableFtp}`);
        return;
    }

    console.log("Process completed successfully without errors");
    
  } catch (error) {
    core.setFailed(`Unexpected error occurred: ${error}`);
  }
}

// Run the main function when executed
if (require.main === module) {
  run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { run, getAllFiles, uploadToFTP, copyFiles, getVersionFromConfig };