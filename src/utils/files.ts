import * as fs from 'fs';
import * as path from 'path';
import { FileInfo, ProcessResult } from '../types';

/**
 * Get all files from a directory recursively
 * @param dirPath - Directory to scan
 * @param arrayOfFiles - Accumulator for found files
 * @returns Array of file paths
 */
export function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true, encoding: 'utf-8' });

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    }

    return arrayOfFiles;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return arrayOfFiles;
  }
}

/**
 * Get file information
 * @param filePath - Path to the file
 * @returns File information object
 */
export function getFileInfo(filePath: string): FileInfo | null {
  try {
    const stats = fs.statSync(filePath);
    return {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      modified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    console.error(`Error getting file info for ${filePath}:`, error);
    return null;
  }
}

/**
 * Create directory if it doesn't exist
 * @param dirPath - Directory path to create
 * @returns Success status
 */
export function createDirectory(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return fs.existsSync(dirPath);
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error);
    return false;
  }
}

/**
 * Copy files from source to target directory
 * @param sourceDir - Source directory
 * @param targetDir - Target directory
 * @param version - Version number to filter files
 * @returns Process result
 */
export function copyFiles(sourceDir: string, targetDir: string, version?: string): ProcessResult {
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
    const copiedFiles: string[] = [];

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
        copiedFiles.push(fileName);
        fileCount++;
      } catch (error) {
        console.error(`ERROR copying ${path.basename(file)}:`, error);
        errorCount++;
      }
    }

    console.log(`Copy completed! Files copied: ${fileCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);

    // Print the list of copied files
    if (copiedFiles.length > 0) {
      console.log('\n=== Copied Files List ===');
      copiedFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });
      console.log('=========================\n');
    }

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
  } catch (error) {
    throw new Error(`Failed to copy files: ${error}`);
  }
}

/**
 * Format path for different platforms
 * @param inputPath - Path to format
 * @returns Formatted path
 */
export function formatPath(inputPath: string): string {
  if (!inputPath) return '';
  let formatted = inputPath.replace(/\\/g, '/');
  if (!formatted.startsWith('/')) {
    formatted = '/' + formatted;
  }
  if (!formatted.endsWith('/')) {
    formatted = formatted + '/';
  }
  return formatted;
}

/**
 * Verify files in target directory
 * @param targetDir - Target directory to verify
 */
export function verifyFiles(targetDir: string): void {
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
  } catch (error) {
    console.error("Error verifying files:", error);
  }
}