import { deploy, excludeDefaults } from '@samkirkland/ftp-deploy';
import { FtpConfig, DeploymentResult } from '../types';
import { getAllFiles } from './files';

/**
 * Upload files to FTP server
 * @param localDir - Local directory to upload
 * @param ftpConfig - FTP configuration
 * @returns Deployment result
 */
export async function uploadToFTP(localDir: string, ftpConfig: FtpConfig): Promise<DeploymentResult> {
  try {
    console.log(`Uploading files to FTP server: ${ftpConfig.host}`);
    console.log(`Local directory: ${localDir}`);
    console.log(`Server directory: ${ftpConfig.serverDir}`);

    // Ensure local-dir and server-dir end with / as required by ftp-deploy
    const normalizedLocalDir = localDir.endsWith('/') ? localDir : localDir + '/';
    const normalizedServerDir = (ftpConfig.serverDir || '/').endsWith('/') ? ftpConfig.serverDir : (ftpConfig.serverDir || '') + '/';
    
    await deploy({
      server: ftpConfig.host,
      username: ftpConfig.user,
      password: ftpConfig.password,
      'local-dir': normalizedLocalDir,
      'server-dir': normalizedServerDir,
      'dangerous-clean-slate': false,
      exclude: excludeDefaults
    });

    console.log('FTP upload completed successfully!');
    const fileCount = getAllFiles(localDir).length;
    console.log(`Files deployed: ${fileCount}`);

    return {
      success: true,
      message: 'FTP deployment completed successfully',
      filesDeployed: fileCount
    };
  } catch (error) {
    console.error('FTP deployment failed:', error);
    return {
      success: false,
      message: `FTP deployment failed: ${error}`,
      filesDeployed: 0
    };
  }
}