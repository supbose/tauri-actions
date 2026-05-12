import { FileInfo, ProcessResult } from '../types';
export declare function getAllFiles(dirPath: string, arrayOfFiles?: string[]): string[];
export declare function getFileInfo(filePath: string): FileInfo | null;
export declare function createDirectory(dirPath: string): boolean;
export declare function copyFiles(sourceDir: string, targetDir: string, version?: string): ProcessResult;
export declare function formatPath(inputPath: string): string;
export declare function verifyFiles(targetDir: string): void;
//# sourceMappingURL=files.d.ts.map