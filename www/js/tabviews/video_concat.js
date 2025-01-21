import { BaseTabView } from "../tabs.js";

export class VideoConcatTabView extends BaseTabView {
    constructor(title) {
        super(title);
        this.pane = document.createElement('div');
        this.pane.classList.add('flex', 'flex-column', 'flex-grow-1', 'gap-5', 'overflow-y-scroll');
        
        const inputVideoConf = this.createInputVideFilesPathDom();
        inputVideoConf.getElementsByClassName('add-input')[0].addEventListener('click', () => {
            const newInput = document.createElement('input');
            newInput.type = 'text';
            inputVideoConf.getElementsByClassName('video-path-input-list')[0].append(newInput);
        });

        const videoConf = document.createElement('div');
        videoConf.classList.add('flex', 'flex-column', 'flex-center', 'gap-5');
        videoConf.append(this.createOutVideoResolutionDom(), this.createOutVideoTypeDom(), this.createOutVideoPathDom());

        const btnNomalText = '开始拼接';
        const btnRunningText = '正在拼接...';
        const startBtn = document.createElement('button');
        startBtn.innerText = btnNomalText;
        startBtn.classList.add('btn');
        startBtn.style.width = '100px'
        const btnDiv = document.createElement('div');
        btnDiv.classList.add('flex', 'justify-content-center');
        btnDiv.append(startBtn);

        startBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const videoResolutionInputs = videoConf.getElementsByClassName('out-video-resolution-select')[0].getElementsByTagName('input');
            const videoTypeInputs = videoConf.getElementsByClassName('out-video-type-select')[0].getElementsByTagName('input');
            const outVideoPathInput = videoConf.getElementsByClassName('out-video-path-input')[0];

            let videoResolutionStr = null;
            for (let i = 0; i < videoResolutionInputs.length; i++) {
                const input = videoResolutionInputs[i];
                if (input.checked) {
                    videoResolutionStr = input.value;
                    break;
                }
            }
            let videoTypeStr = null;
            for (let i = 0; i < videoTypeInputs.length; i++) {
                const input = videoTypeInputs[i];
                if (input.checked) {
                    videoTypeStr = input.value;
                    break;
                }
            }
            if (videoResolutionStr && videoTypeStr) {
                // 获取信息
                const rList = videoResolutionStr.split('x');
                const width = Number(rList[0]);
                const height = Number(rList[1]);
                console.log(`输出格式：横向${width}像素 纵向${height}像素 ${videoTypeStr}文件`);
                const inputFilePathList = this.pane.getElementsByClassName('video-path-input-list')[0].getElementsByTagName('input');
                const videoPathList = [];
                for (let i = 0; i < inputFilePathList.length; i++) {
                    const input = inputFilePathList[i];
                    if (input.value) {
                        videoPathList.push(input.value);
                    }
                }
                console.log(`待合并文件：\n${videoPathList.join('\n')}`);
                if (videoPathList.length > 0) {
                    const wsUrl = `ws://${window.location.hostname}:${window.location.port}`;
                    const ws = new WebSocket(wsUrl);
                    ws.addEventListener('open', (ev) => {
                        const msg = JSON.stringify({
                            action: 'check-file-is-video',
                            videoPathList: videoPathList,
                            outVideoPath: outVideoPathInput.value
                        });
                        console.log(msg);
                        ws.send(msg);
                    })
                    ws.addEventListener('message', (ev) => {
                        const res = JSON.parse(ev.data);
                        switch (res?.action) {
                            case 'check-file-is-video-res': {
                                const isOk = res?.isOk;
                                if (isOk) {
                                    console.log('确认视频文件都没问题');
                                    ws.send(JSON.stringify({ action: 'video-concat', filePath: videoPathList, width: width, height: height, format: videoTypeStr, outPath: outVideoPathInput.value }));
                                    startBtn.disabled = true; 
                                    startBtn.innerText = btnRunningText; 
                                } else {
                                    alert(res?.error);
                                    ws.close(); 
                                }
                                break;
                            }
                            case 'video-concat-res': {
                                const isOk = res?.isOk;
                                if(isOk){
                                    alert('合并视频成功' + res?.outVideoFilePath);
                                }else {
                                    alert('合并视频失败');
                                }
                                ws.close(); 
                                startBtn.disabled = false; 
                                startBtn.innerText = btnNomalText; 
                                break;
                            }
                            default:
                                break;
                        }
                    });

                }
            }
        });

        this.pane.append(inputVideoConf, videoConf, btnDiv);
    }

    /*创建标签页内容*/
    createTabHtml() { return this.pane; }

    createOutVideoResolutionDom() {
        const str = `<div>
                <div class='out-video-resolution-select flex flex-row gap-5 align-items-center'>
                    <div>输出视频分辨率 </div>
                    <label><input type="radio" name="video-resolution" value="1920x1080" /> 1920x1080</label>
                    <label><input type="radio" name="video-resolution" value="1280x720" checked /> 1280x720</label>
                    <label><input type="radio" name="video-resolution" value="720x480" /> 720x480</label>
                </div>
            </div>`
        const _d = document.createElement('div');
        _d.innerHTML = str;
        return _d.children[0];
    }

    createOutVideoTypeDom() {
        const str = `<div>
                <div class='out-video-type-select flex flex-row gap-5 align-items-center'>
                    <div>输出视频格式 </div>
                    <label><input type="radio" name="video-type" value="mp4" checked />.mp4</label>
                    <label><input type="radio" name="video-type" value="avi" />.avi</label>
                </div>
            </div>`
        const _d = document.createElement('div');
        _d.innerHTML = str;
        return _d.children[0];
    }

    createOutVideoPathDom() {
        const div = document.createElement('div');
        div.classList.add('flex', 'flex-row', 'align-items-center', 'gap-5'); 
        div.style.width = '80%'; 
        const input = document.createElement('input');
        input.type = 'text';
        div.innerHTML = `<span>输出目录</span> <input type="text" class='out-video-path-input flex-grow-1'/>`
        return div;
    }

    createInputVideFilesPathDom() {
        const str = `<div class="flex flex-column flex-center gap-5">
                <div>加载视频文件路径</div>
                <div class='video-path-input-list flex flex-column gap-5' style="width:80%;">
                    <input type="text" /> 
                    <input type="text" />
                </div>

                <div>
                    <button class='btn add-input'> + 增加视频文件 </button>
                </div>
            </div>`
        const _d = document.createElement('div');
        _d.innerHTML = str;
        return _d.children[0];
    }
}