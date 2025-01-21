import { BaseTabView } from "../tabs.js";

export class VideoFormatConversionTabView extends BaseTabView {
    constructor(title) {
        super(title);
        this.pane = document.createElement('div'); 
        this.pane.classList.add('flex', 'flex-column', 'flex-grow-1', 'gap-5', 'overflow-y-scroll');

        const fileInputDiv = this.createFileInputDom(); 
        const outConfDiv = this.createOutConfDom(); 
        const fileOutputDiv=this.createFileOutDom(); 
        this.inputFilePathDom = fileInputDiv.getElementsByTagName('input')[0]; 
        this.outputFilePathDom=fileOutputDiv.getElementsByTagName('input')[0]; 
        this.outFileTypeDomList=outConfDiv.getElementsByTagName('input'); 

        const btnNomalText = '开始转换';
        const btnRunningText = '正在转换...';
        this.startBtn = document.createElement('button');
        this.startBtn.innerText = btnNomalText; 
        this.startBtn.classList.add('btn'); 

        this.startBtn.addEventListener('click', (ev)=>{
            ev.stopPropagation();
            let outType = null;
            for(let i=0;i<this.outFileTypeDomList.length;i++){
                const input = this.outFileTypeDomList[i];
                if(input.checked == true){
                    outType = input.value; 
                }
            }
            if(outType == null){
                alert('请检查输出视频类型');
                return;
            }
            const inputFilePath = this.inputFilePathDom.value; 
            const outputDir =this.outputFilePathDom.value; 
            if(inputFilePath && outputDir ){
                const wsUrl = `ws://${window.location.hostname}:${window.location.port}`;
                    const ws = new WebSocket(wsUrl);
                    ws.addEventListener('open', (ev) => {
                        const msg = JSON.stringify({
                            action: 'check-file-is-video',
                            videoPathList: [inputFilePath],
                            outVideoPath: outputDir
                        });
                        console.log(msg);
                        ws.send(msg);
                    }); 
                    ws.addEventListener('message', (ev) => {
                        const res = JSON.parse(ev.data);
                        switch (res?.action) {
                            case 'check-file-is-video-res': {
                                const isOk = res?.isOk;
                                if (isOk) {
                                    console.log('确认视频文件都没问题');
                                    ws.send(JSON.stringify({ action: 'video-format-conversion', inputFilePath: inputFilePath, outputDir: outputDir, outType:outType }));
                                    this.startBtn.disabled = true; 
                                    this.startBtn.innerText = btnRunningText; 
                                } else {
                                    alert(res?.error);
                                    ws.close(); 
                                }
                                break;
                            }
                            case 'video-format-conversion-res': {
                                const isOk = res?.isOk;
                                if(isOk){
                                    alert('转换视频成功' + res?.outVideoFilePath);
                                }else {
                                    alert('转换视频失败');
                                }
                                ws.close(); 
                                this.startBtn.disabled = false; 
                                this.startBtn.innerText = btnNomalText; 
                                break;
                            }
                            default:
                                break;
                        }
                    });
            }else {
                alert('请检查输入输出文件路径是否已设置');
                return; 
            }
        });

        this.pane.append(fileInputDiv, outConfDiv, fileOutputDiv, this.startBtn); 
        

    }

    createTabHtml() {
        return this.pane;
    }

    createFileInputDom(){
        const str = ` <span>输入文件路径：</span> <input type="text" />`;
        const fileInputDiv = document.createElement('div');
        fileInputDiv.classList.add('flex', 'flex-row', 'gap-5', 'align-items-center');
        fileInputDiv.innerHTML = str; 
        fileInputDiv.getElementsByTagName('input')[0].classList.add('flex-grow-1');

        return fileInputDiv; 
    }
    createOutConfDom(){
        const str = `<label>输出格式：</label>
                <label class='align-items-center'><input type="radio" name="video_type_format" value="mp4" checked>.mp4</label>
                <label class='align-items-center'><input type="radio" name="video_type_format" value="avi">.avi</label>
                <label class='align-items-center'><input type="radio" name="video_type_format" value="mov">.mov</label>
                <label class='align-items-center'><input type="radio" name="video_type_format" value="flv">.flv</label>`;
        const fileOutConfDiv = document.createElement('div');
        fileOutConfDiv.classList.add('flex', 'flex-row', 'gap-5', 'align-items-center');
        fileOutConfDiv.innerHTML = str; 

        return fileOutConfDiv; 
    }
    createFileOutDom(){
        const str = ` <span>输出目录路径：</span> <input type="text" />`;
        const fileOutputDiv = document.createElement('div');
        fileOutputDiv.classList.add('flex', 'flex-row', 'gap-5', 'align-items-center');
        fileOutputDiv.innerHTML = str; 
        fileOutputDiv.getElementsByTagName('input')[0].classList.add('flex-grow-1');

        return fileOutputDiv; 
    }
}