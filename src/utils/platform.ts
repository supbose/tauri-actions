/**
 * Get platform keys from file name
 * @param fileName - File name to parse
 * @returns Array of platform keys
 */
export function getPlatformKeys(fileName: string): string[] {
  const keys: string[] = [];
  
  // Check for macOS files first (darwin/mac)
  if (fileName.includes('darwin') || fileName.includes('mac') || fileName.includes('.dmg')) {
    if (fileName.includes('arm64') || fileName.includes('aarch64')) {
      keys.push('darwin-aarch64');
    } else if (fileName.includes('x64') || fileName.includes('x86_64')) {
      keys.push('darwin-x86_64');
    } else {
      // Default to x86_64 if no architecture specified
      keys.push('darwin-x86_64');
    }
    return keys; // Return early for macOS to avoid incorrect classification
  }
  
  // Windows x64
  if (fileName.includes('x64') || fileName.includes('x86_64')) {
    if (fileName.includes('.msi')) {
      keys.push('windows-x86_64-msi');
    } else if (fileName.includes('-setup.exe') || fileName.includes('_setup.exe')) {
      keys.push('windows-x86_64-nsis');
      keys.push('windows-x86_64');
    } else if (fileName.includes('.zip') || fileName.includes('.exe')) {
      keys.push('windows-x86_64');
    }
  }
  
  // Windows arm64
  if (fileName.includes('arm64') || fileName.includes('aarch64')) {
    if (fileName.includes('.msi')) {
      keys.push('windows-aarch64-msi');
    } else if (fileName.includes('-setup.exe') || fileName.includes('_setup.exe')) {
      keys.push('windows-aarch64-nsis');
      keys.push('windows-aarch64');
    } else if (fileName.includes('.zip')) {
      keys.push('windows-aarch64');
    }
  }
  
  // Linux
  if (fileName.includes('linux')) {
    if (fileName.includes('amd64') || fileName.includes('x86_64')) {
      keys.push('linux-x86_64');
    } else if (fileName.includes('arm64')) {
      keys.push('linux-aarch64');
    }
  }
  
  return keys;
}