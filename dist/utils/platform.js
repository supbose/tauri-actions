export function getPlatformKeys(fileName) {
    const keys = [];
    if (fileName.includes('x64') || fileName.includes('x86_64')) {
        if (fileName.includes('.msi')) {
            keys.push('windows-x86_64-msi');
        }
        else if (fileName.includes('-setup.exe') || fileName.includes('_setup.exe')) {
            keys.push('windows-x86_64-nsis');
            keys.push('windows-x86_64');
        }
        else if (fileName.includes('.zip') || fileName.includes('.exe')) {
            keys.push('windows-x86_64');
        }
    }
    if (fileName.includes('arm64')) {
        if (fileName.includes('.msi')) {
            keys.push('windows-aarch64-msi');
        }
        else if (fileName.includes('-setup.exe') || fileName.includes('_setup.exe')) {
            keys.push('windows-aarch64-nsis');
            keys.push('windows-aarch64');
        }
        else if (fileName.includes('.zip')) {
            keys.push('windows-aarch64');
        }
    }
    if (fileName.includes('darwin') || fileName.includes('mac')) {
        if (fileName.includes('arm64')) {
            keys.push('darwin-aarch64');
        }
        else {
            keys.push('darwin-x86_64');
        }
    }
    if (fileName.includes('linux')) {
        if (fileName.includes('amd64') || fileName.includes('x86_64')) {
            keys.push('linux-x86_64');
        }
        else if (fileName.includes('arm64')) {
            keys.push('linux-aarch64');
        }
    }
    return keys;
}
//# sourceMappingURL=platform.js.map