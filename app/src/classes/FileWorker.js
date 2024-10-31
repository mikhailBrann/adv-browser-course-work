import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export default class FileWorker {
    static async readFile(pathTofile) {
        if(!pathTofile) {
            return;
        }

        const data = await fs.promises.readFile(pathTofile, 'utf8');
        return data;
    }

    static async createDirectory(uploadDirArr) {
        
        const uploadDir = join(...uploadDirArr);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        return await uploadDir;
    }

    static async writeFile(data, pathTofileArr=false, fileName=false) {
        if(!fileName && !pathTofile) {
            return;
        }

        const filePath = await this.createDirectory(pathTofileArr);

        const resultFilePath = join(filePath, fileName);
        await fs.promises.writeFile(resultFilePath, data);
        
        return resultFilePath;
    }

    static getTypeFile(path) {
        const ext = path.split('.').pop();

        switch(true) {
            case ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext):
                return 'image';
            case ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext):
                return 'audio';
            case ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext):
                return 'video';
            default:
                return 'file';
        }
    }
}