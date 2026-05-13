import { ActionInputs, ValidationResult } from '../types';
export declare function isValidUrl(url: string): boolean;
export declare function isValidPath(path: string): boolean;
export declare function isValidVersion(version: string): boolean;
export declare function isValidTimezone(timezone: string): boolean;
export declare function isValidFtpHost(host: string): boolean;
export declare function validateInputs(inputs: ActionInputs): ValidationResult;
export declare function sanitizeLogMessage(message: string, sensitiveKeys?: string[]): string;
export declare function createActionError(message: string, code?: string, details?: any): Error;
//# sourceMappingURL=validation.d.ts.map