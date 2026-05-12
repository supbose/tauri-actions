import { deploy, excludeDefaults } from '@samkirkland/ftp-deploy';
import { getAllFiles } from './files';
export async function uploadToFTP(localDir, ftpConfig) {
    try {
        console.log(`Uploading files to FTP server: ${ftpConfig.host}`);
        console.log(`Local directory: ${localDir}`);
        console.log(`Server directory: ${ftpConfig.serverDir}`);
        await deploy({
            server: ftpConfig.host,
            username: ftpConfig.user,
            password: ftpConfig.password,
            'local-dir': localDir,
            'server-dir': ftpConfig.serverDir || '/',
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
    }
    catch (error) {
        console.error('FTP deployment failed:', error);
        return {
            success: false,
            message: `FTP deployment failed: ${error}`,
            filesDeployed: 0
        };
    }
}
//# sourceMappingURL=ftp.js.map