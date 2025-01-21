import { SimpleVirtualFileSystem } from "./M_svfs_bun.js";
const svfs = new SimpleVirtualFileSystem();
async function main() {
    const decoder = new TextDecoder();
    let val;
    let file_path_list = ['/index.html', '/js/tabviews/test.html', '/js/lib/qrcode.js', '/js/tabviews/video_format_conversion.js'];
    for (const file_path of file_path_list) {
        console.log(`================ ${file_path} ================`);
        val = await svfs.readByPath(file_path)
        if (val) {
            const str = decoder.decode(val);
            console.log(str);
        } else {
            console.log(val);
        }
    }

}
main(); 