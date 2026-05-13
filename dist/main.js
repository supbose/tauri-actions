import * as core from '@actions/core';
import 'dotenv/config';
import { initializeToken, getRepositoryInfo, getLatestRelease } from './utils/github';
import { getVersionFromConfig } from './utils/version';
import { copyFiles, createDirectory, verifyFiles, formatPath, getAllFiles } from './utils/files';
import { uploadToFTP } from './utils/ftp';
import { updateAndUploadLatestJson } from './utils/latest';
import { validateInputs, sanitizeLogMessage } from './utils/validation';
async function uploadLatestVersion(targetVersion, localUploadDir, ftpConfig) {
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
    }
    catch (error) {
        console.error('Error uploading latest version:', error);
        throw error;
    }
}
async function run() {
    try {
        initializeToken();
        const inputs = {
            sourceDir: core.getInput('source-dir'),
            targetRoot: core.getInput('target-root'),
            configFile: core.getInput('config-file'),
            filterByVersion: core.getInput('filter-by-version') === 'true',
            enableFtp: core.getInput('enable-ftp'),
            ftpHost: core.getInput('ftp-host'),
            ftpUsername: core.getInput('ftp-username'),
            ftpPassword: core.getInput('ftp-password'),
            ftpServerDir: core.getInput('ftp-server-dir'),
            uploadLatest: core.getInput('upload-latest'),
            githubToken: core.getInput('github-token'),
            cdnBaseUrl: core.getInput('cdn-base-url'),
            timezone: core.getInput('timezone')
        };
        const validation = validateInputs(inputs);
        if (!validation.valid) {
            core.setOutput('upload-latest', 'disabled');
            core.setFailed(`Input validation failed: ${validation.errors.join(', ')}`);
            return;
        }
        const version = getVersionFromConfig(inputs.configFile);
        console.log(`Using version: ${version}`);
        core.setOutput('version', version);
        core.setOutput('enable-ftp', inputs.enableFtp);
        const targetDir = `${inputs.targetRoot}/v${version}`;
        console.log(`Target directory: ${targetDir}`);
        const fs = await import('fs');
        try {
            fs.writeFileSync('version.txt', version, 'utf8');
        }
        catch (error) {
            console.log(`Warning: Failed to save version file:`, error);
        }
        if (!createDirectory(targetDir)) {
            core.setFailed(`Failed to create target directory: ${targetDir}`);
            return;
        }
        core.setOutput('target-dir', targetDir);
        const versionToFilter = inputs.filterByVersion ? version : undefined;
        const copyResult = copyFiles(inputs.sourceDir, targetDir, versionToFilter);
        if (!copyResult.success) {
            core.setFailed(`Failed to copy files`);
            return;
        }
        verifyFiles(targetDir);
        if (inputs.uploadLatest === 'disabled') {
            console.log(`✅ Latest version upload is disabled`);
        }
        else if (inputs.uploadLatest === 'ci') {
            console.log("✅ Using plugin to trigger latest version upload");
        }
        else if (inputs.uploadLatest === 'use') {
            console.log(`✅ Using built-in FTP upload for latest version files`);
            if (inputs.githubToken) {
                console.log(`✅ GitHub Token: ${sanitizeLogMessage(inputs.githubToken)}`);
            }
        }
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
                const ftpConfig = {
                    host: inputs.ftpHost,
                    user: inputs.ftpUsername,
                    password: inputs.ftpPassword,
                    serverDir: formatPath(inputs.ftpServerDir)
                };
                if (inputs.uploadLatest === 'use' && inputs.githubToken) {
                    console.log(`✅ --------------------------------`);
                    console.log(`✅ Generating latest.json before FTP upload`);
                    console.log(`✅ GitHub Token: ${sanitizeLogMessage(inputs.githubToken)}`);
                    console.log(`✅ --------------------------------`);
                    try {
                        await uploadLatestVersion(version, targetDir, ftpConfig);
                        core.setOutput('latest-upload-success', 'true');
                    }
                    catch (error) {
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
    }
    catch (error) {
        core.setFailed(`Unexpected error occurred: ${error}`);
    }
}
if (require.main === module) {
    run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
export { run, getAllFiles, uploadToFTP, copyFiles, getVersionFromConfig };
//# sourceMappingURL=main.js.map