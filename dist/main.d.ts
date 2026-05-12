import 'dotenv/config';
import { getVersionFromConfig } from './utils/version';
import { copyFiles, getAllFiles } from './utils/files';
import { uploadToFTP } from './utils/ftp';
declare function run(): Promise<void>;
export { run, getAllFiles, uploadToFTP, copyFiles, getVersionFromConfig };
//# sourceMappingURL=main.d.ts.map