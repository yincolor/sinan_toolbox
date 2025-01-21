
import path from "node:path";
import { execCommand } from "./exec_command.js";

/** 检查是否有需要的依赖项，比如ffmpeg */
export async function checkDependencies(){
    let ffmpegCheckStr = '';
    await execCommand('which ffmpeg', (val)=>{
        ffmpegCheckStr += val;
    },(val)=>{});
    ffmpegCheckStr = ffmpegCheckStr.trim();
    if(ffmpegCheckStr.length <= 0){
        console.log('系统没有安装 ffmpeg ，影响视频处理相关的功能，请安装 ffmpeg');
        console.log('Ubuntu: sudo apt install ffmpeg');
        return false; 
    }
    return true; 
}

/** 获取本机的下载目录路径 */
export async function getDownloadDir() {
    const userDirsFilePath = path.join(process.env['HOME'], './.config/user-dirs.dirs');
    const userDirsFile = Bun.file(userDirsFilePath);
    const str = await userDirsFile.text();
    const matchStrList = str.match(/^XDG_DOWNLOAD_DIR="([^"]*)"/m);
    if(matchStrList.length >0){
        const downloadDir = matchStrList[1];
        return downloadDir.replace('$HOME', process.env['HOME'])
    }else {
        return null;
    }
}