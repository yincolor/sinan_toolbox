export class utils {
    constructor() { throw new Error("this is a static class."); }
    /** 获取模块的目录路径 */
    static getModuleDir(url_str) {
        const self_url = new URL(url_str);
        const pathname = self_url.pathname;
        const dir = pathname.slice(0, pathname.lastIndexOf('/'));
        // console.log(`dir = ${dir}`);

        return dir == '/' ? dir : dir + '/'
    }
    /**
     * 请求Html
     * @param {string} url 
     * @returns 
     */
    static async getHtml(url){
        // console.log(`get url = ${url}`);
        
        const res = await fetch(url);
        const str = await res.text(); 
        // console.log(str);
        
        const parser = new DOMParser();
        const html = parser.parseFromString(str,'text/html');
        // const dom = html.getElementsByTagName('template')[0]?.content?.cloneNode(true);
        if(html){
            return html;
        }else {
            return null; 
        }
    }

    static __registerSignalCallFuncs = {};
    /**
     * 注册信号回调函数
     * @param {String} signalName 信号名称
     * @param {Function} callback 回调函数
     * @returns 
     */
    static registerSignalCallFunc(signalName, callback){
        const signalNameList = Object.keys(this.__registerSignalCallFuncs);
        if(!(signalNameList.indexOf(signalName) >= 0)){
            this.__registerSignalCallFuncs[signalName] = []; 
        }
        this.__registerSignalCallFuncs[signalName].push(callback); 
        return true; 
    }
    /**
     * 发送信号
     * @param {String} signalName 信号名称 
     * @param  {...any} args 携带的参数
     */
    static sendSignal(signalName, ...args){
        const callbacks = this.__registerSignalCallFuncs[signalName];
        if(callbacks){
            for(const call of callbacks){
                call(...args); 
            }
        }
    }
}