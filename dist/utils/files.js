import * as fs from 'fs';
import * as path from 'path';
export function getAllFiles(dirPath, arrayOfFiles = []) {
    try {
        const files = fs.readdirSync(dirPath, { withFileTypes: true, encoding: 'utf-8' });
        for (const file of files) {
            const fullPath = path.join(dirPath, file.name);
            if (file.isDirectory()) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
            else {
                arrayOfFiles.push(fullPath);
            }
        }
        return arrayOfFiles;
    }
    catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return arrayOfFiles;
    }
}
export function getFileInfo(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return {
            name: path.basename(filePath),
            path: filePath,
            size: stats.size,
            modified: stats.mtime,
            isDirectory: stats.isDirectory()
        };
    }
    catch (error) {
        console.error(`Error getting file info for ${filePath}:`, error);
        return null;
    }
}
export function createDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            console.log(`Creating directory: ${dirPath}`);
            fs.mkdirSync(dirPath, { recursive: true });
        }
        return fs.existsSync(dirPath);
    }
    catch (error) {
        console.error(`Failed to create directory ${dirPath}:`, error);
        return false;
    }
}
export function copyFiles(sourceDir, targetDir, version) {
    try {
        if (!fs.existsSync(sourceDir)) {
            throw new Error(`Source directory does not exist: ${sourceDir}`);
        }
        console.log(`Source directory exists: ${sourceDir}`);
        console.log(`Copying files from ${sourceDir} to ${targetDir} (flat structure)`);
        if (version) {
            console.log(`Filtering files by version: ${version}`);
        }
        const files = getAllFiles(sourceDir);
        let fileCount = 0;
        let errorCount = 0;
        let skippedCount = 0;
        for (const file of files) {
            try {
                const fileName = path.basename(file);
                if (version && !fileName.includes(version)) {
                    console.log(`Skipped (version mismatch): ${fileName}`);
                    skippedCount++;
                    continue;
                }
                const targetPath = path.join(targetDir, fileName);
                fs.copyFileSync(file, targetPath);
                console.log(`Copied: ${fileName}`);
                fileCount++;
            }
            catch (error) {
                console.error(`ERROR copying ${path.basename(file)}:`, error);
                errorCount++;
            }
        }
        console.log(`Copy completed! Files copied: ${fileCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
        if (errorCount > 0) {
            console.log(`Warning: ${errorCount} file(s) failed to copy`);
        }
        if (skippedCount > 0) {
            console.log(`Info: ${skippedCount} file(s) skipped due to version mismatch`);
        }
        return {
            success: errorCount === 0,
            version: '',
            targetDir,
            filesCopied: fileCount
        };
    }
    catch (error) {
        throw new Error(`Failed to copy files: ${error}`);
    }
}
export function formatPath(inputPath) {
    if (!inputPath)
        return '';
    let formatted = inputPath.replace(/\\/g, '/');
    if (!formatted.startsWith('/')) {
        formatted = '/' + formatted;
    }
    if (!formatted.endsWith('/')) {
        formatted = formatted + '/';
    }
    return formatted;
}
export function verifyFiles(targetDir) {
    try {
        console.log("Verifying files in target directory:");
        const targetFiles = getAllFiles(targetDir);
        console.log(`Files in ${targetDir}:`);
        targetFiles.forEach(file => {
            const fileInfo = getFileInfo(file);
            if (fileInfo) {
                console.log(`  - ${fileInfo.name} (${fileInfo.size} bytes)`);
            }
        });
        console.log(`Total files: ${targetFiles.length}`);
    }
    catch (error) {
        console.error("Error verifying files:", error);
    }
}
//# sourceMappingURL=files.js.map