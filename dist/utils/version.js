import * as fs from 'fs';
export function getVersionFromConfig(configFile) {
    try {
        if (!fs.existsSync(configFile)) {
            console.log(`Warning: Config file not found: ${configFile}`);
            return "0.0.0";
        }
        const configContent = fs.readFileSync(configFile, 'utf8');
        const config = JSON.parse(configContent);
        if (config.version) {
            console.log(`Version from config root: ${config.version}`);
            return config.version;
        }
        if (config.package?.version) {
            console.log(`Version from package config: ${config.package.version}`);
            return config.package.version;
        }
        console.log("Warning: Version not found in config file");
        return "0.0.0";
    }
    catch (error) {
        console.log(`Warning: Could not parse config file: ${error}`);
        return "0.0.0";
    }
}
export function validateInputs(inputs) {
    const errors = [];
    const warnings = [];
    if (!['disabled', 'ci', 'use'].includes(inputs.enableFtp)) {
        errors.push(`Invalid enable-ftp value: ${inputs.enableFtp}. Must be one of: disabled, ci, use`);
    }
    if (!['disabled', 'ci', 'use'].includes(inputs.uploadLatest)) {
        errors.push(`Invalid upload-latest value: ${inputs.uploadLatest}. Must be one of: disabled, ci, use`);
    }
    if (inputs.uploadLatest !== 'disabled' && !inputs.githubToken) {
        errors.push('GitHub token is required when upload-latest is not disabled');
    }
    if (inputs.enableFtp === 'use') {
        if (!inputs.ftpHost || !inputs.ftpUsername || !inputs.ftpPassword) {
            errors.push('FTP credentials are required when enable-ftp is set to "use"');
        }
    }
    return { valid: errors.length === 0, errors, warnings };
}
//# sourceMappingURL=version.js.map