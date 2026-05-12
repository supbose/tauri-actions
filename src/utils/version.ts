import * as fs from 'fs';
import { ConfigFile } from '../types';

/**
 * Get version from configuration file
 * @param configFile - Path to configuration file
 * @returns Version string
 */
export function getVersionFromConfig(configFile: string): string {
  try {
    if (!fs.existsSync(configFile)) {
      console.log(`Warning: Config file not found: ${configFile}`);
      return "0.0.0";
    }

    const configContent = fs.readFileSync(configFile, 'utf8');
    const config: ConfigFile = JSON.parse(configContent);

    // Try root-level version first
    if (config.version) {
      console.log(`Version from config root: ${config.version}`);
      return config.version;
    }
    
    // Try package.version if root-level doesn't exist
    if (config.package?.version) {
      console.log(`Version from package config: ${config.package.version}`);
      return config.package.version;
    }

    console.log("Warning: Version not found in config file");
    return "0.0.0";
  } catch (error) {
    console.log(`Warning: Could not parse config file: ${error}`);
    return "0.0.0";
  }
}

/**
 * Validate action inputs
 * @param inputs - Input parameters to validate
 * @returns Validation result
 */
export function validateInputs(inputs: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate enable-ftp
  if (!['disabled', 'ci', 'use'].includes(inputs.enableFtp)) {
    errors.push(`Invalid enable-ftp value: ${inputs.enableFtp}. Must be one of: disabled, ci, use`);
  }

  // Validate upload-latest
  if (!['disabled', 'ci', 'use'].includes(inputs.uploadLatest)) {
    errors.push(`Invalid upload-latest value: ${inputs.uploadLatest}. Must be one of: disabled, ci, use`);
  }

  // Validate GitHub token when required
  if (inputs.uploadLatest !== 'disabled' && !inputs.githubToken) {
    errors.push('GitHub token is required when upload-latest is not disabled');
  }

  // Check required FTP parameters
  if (inputs.enableFtp === 'use') {
    if (!inputs.ftpHost || !inputs.ftpUsername || !inputs.ftpPassword) {
      errors.push('FTP credentials are required when enable-ftp is set to "use"');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}