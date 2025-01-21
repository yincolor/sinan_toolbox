
import { utils } from "../utils.js";
import { ImageFormatConversionTabView } from "./image_format_conversion.js";
import { MD5TabView } from "./md5.js";
import { QRCodeTabView } from "./qr_code.js";
import { TextBase64TabView } from "./text_base64.js";
import { VideoConcatTabView } from "./video_concat.js";
import { VideoFormatConversionTabView } from "./video_format_conversion.js";
const moduleDir = utils.getModuleDir(new URL(import.meta.url));

export const apps = [
    { name: '视频文件格式转换',         jsPath: `${moduleDir}video_format_conversion.js`, className:VideoFormatConversionTabView },
    { name: '视频拼接',                 jsPath: `${moduleDir}video_concat.js`,            className: VideoConcatTabView },
    { name: '文字base64编解码',         jsPath: `${moduleDir}text_base64.js`,             className:TextBase64TabView},
    { name: '计算MD5摘要',              jsPath: `${moduleDir}md5.js`,                     className: MD5TabView },
    { name: '生成二维码（QR Code）',    jsPath: `${moduleDir}qr_code.js`,                 className: QRCodeTabView },
]
