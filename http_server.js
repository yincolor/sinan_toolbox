import { readdir } from "node:fs/promises";
import { execCommand } from "./exec_command.js";
import { getDownloadDir } from "./sys.js";
const userDownloadDir = await getDownloadDir();

const ip = '127.0.0.1';
const http_server = Bun.serve({
    port: 0,
    hostname: ip,
    fetch: async (req, server) => {
        if (server.upgrade(req)) {
            return;
        }
        const url = new URL(req.url);
        // console.log(`[http-server] get request: ${url.pathname}`);
        let req_file_path = '/index.html';
        if (url.pathname != '/') {
            req_file_path = url.pathname;
        }
        return new Response(Bun.file(`www/${req_file_path}`));
    },
    websocket: {
        message: websocketMsgHandler
    }
});

/**
 * 处理 websocket 请求
 * @param {ServerWebSocket<any>} ws 
 * @param {string} msg 
 */
async function websocketMsgHandler(ws, msg) {
    console.log('[main] 获取websocket消息：');
    console.log(msg);
    const res = JSON.parse(msg);
    switch (res?.action) {
        case 'check-file-is-video': {
            /**
             * @type {string[]}
             */
            const fileList = res?.videoPathList;

            console.log(`检查文件是否为视频文件${fileList.join(', ')}`);
            let error = '';
            let checkStatus = true;
            for (const fPath of fileList) {
                const f = Bun.file(fPath);
                if ((await f.exists()) == false) {
                    checkStatus = false;
                    error = `文件不存在 ${f.name}`;
                    break;
                }
                if (f.type.indexOf('video') < 0) {
                    checkStatus = false;
                    error = `文件格式错误，请检查是否为视频格式文件 ${f.name}`;
                    break;
                }
            }
            console.log(`检查输出路径是否已经存在：${res?.outVideoPath}`);
            const outVideoPath = res?.outVideoPath;
            const _isDirectory = await isDirectory(outVideoPath);
            if (_isDirectory == false) {
                checkStatus = false;
                error = `输出路径异常，请检查是否存在此路径：${outVideoPath}`;
            }

            ws.send(JSON.stringify({
                action: 'check-file-is-video-res',
                isOk: checkStatus,
                error: error
            }));
            break;
        }
        case 'video-concat': {
            /**
             * @type {string[]}
             */
            const filePathList = res?.filePath;
            const height = res?.height;
            const width = res?.width;
            const format = res?.format;
            /** @type {string} */
            const outPath = res?.outPath;
            if (filePathList && height && width && format && outPath) {
                const inputStrList = [];
                const filterComplexStrList = [];
                const streamNameList = [];
                const fNum = filePathList.length;
                for (let i = 0; i < fNum; i++) {
                    const fPath = filePathList[i];
                    inputStrList.push(`-i ${fPath}`);
                    filterComplexStrList.push(`[${i}:v]scale=-2:${height},setsar=1,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,fps=25[v${i}];`);
                    streamNameList.push(`[v${i}][${i}:a]`);
                }
                const outVideoFileName = `OutConcatVideo_${createNowTimeStr()}.${format}`;
                const outVideoFilePath = `${outPath}${outPath.endsWith('/') ? "" : "/"}${outVideoFileName}`
                const ffmpegCommandStr = `ffmpeg ${inputStrList.join(' ')} -filter_complex ${filterComplexStrList.join('')}${streamNameList.join('')}concat=n=${fNum}:v=1:a=1[v][a] -map [v] -map [a] ${outVideoFilePath}`;
                console.log('执行命令：', ffmpegCommandStr);
                const concatStatus = await execCommand(ffmpegCommandStr, (val) => {
                    console.log('=========STD OUT=========');
                    console.log(val);
                }, (val) => {
                    console.log('=========STD ERROR=========');
                    console.log(val);
                });
                console.log('合并视频文件结束');
                ws.send(JSON.stringify({
                    action: 'video-concat-res',
                    isOk: concatStatus,
                    outVideoFilePath: outVideoFilePath
                }));
            } else {
                /*数据错误，返回失败信号*/
                ws.send(JSON.stringify({ action: 'video-concat-res', isOk: false, outVideoFilePath: '' }));
            }
            break;
        }
        case 'video-format-conversion': {
            const inputFilePath = res?.inputFilePath;
            const outputDir = res?.outputDir;
            const outType = res?.outType;
            if (inputFilePath && outputDir && outType) {
                const outVideoFileName = `OutConvVideo_${createNowTimeStr()}.${outType}`;
                const outVideoFilePath = `${outputDir}${outputDir.endsWith('/') ? "" : "/"}${outVideoFileName}`
                const ffmpegCommandStr = `ffmpeg -i ${inputFilePath} -acodec copy -vcodec copy -f ${outType} ${outVideoFilePath}`;
                console.log('执行命令：', ffmpegCommandStr);
                const convStatus = await execCommand(ffmpegCommandStr, (val) => {
                    console.log('=========STD OUT=========');
                    console.log(val);
                }, (val) => {
                    console.log('=========STD ERROR=========');
                    console.log(val);
                });
                console.log('合并视频文件结束');
                ws.send(JSON.stringify({
                    action: 'video-format-conversion-res',
                    isOk: convStatus,
                    outVideoFilePath: outVideoFilePath
                }));
            } else {
                ws.send(JSON.stringify({ action: 'video-format-conversion-res', isOk: false, outVideoFilePath: '' }));
            }
            break;
        }
        case 'download': {
            const fileName = res?.fileName;
            const data = res?.data; 
            const dataType = res?.dataType; 
            if(fileName && dataType){
                const f = Bun.file(userDownloadDir+'/'+fileName);
                switch (dataType) {
                    case 'text':
                        await f.write(data);
                        ws.send(JSON.stringify({ action: 'download-res', isOk: true }));
                        break;
                    default:
                        break;
                }
            }else {
                ws.send(JSON.stringify({ action: 'download-res', isOk: false }));
            }
            break;
        }
        default:
            break;
    }
}

async function isDirectory(pathStr) {
    let status = true;
    try {
        const a = await readdir(pathStr);
        console.log(a);

    } catch (error) {
        console.log(error);

        status = false;
    }
    return status;
}

/**
 * 生成当前时间的格式化字符串yyyyMMddHHmmss
 */
function createNowTimeStr() {
    const now = new Date();
    const month = (now.getMonth() + 1);
    const day = now.getDate();
    const hour = now.getHours();

    const min = now.getMinutes();
    const sec = now.getSeconds();
    return `${now.getFullYear()}${month < 10 ? ('0' + month) : month}${day < 10 ? ('0' + day) : day}${hour < 10 ? ('0' + hour) : hour}${min < 10 ? ('0' + min) : min}${sec < 10 ? ('0' + sec) : sec}`
}

console.log(`[main] 服务端创建完毕 open: http://${ip}:${http_server.port}`);