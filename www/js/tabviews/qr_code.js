import { BaseTabView } from "../tabs.js";
import { QRCode } from "../lib/qrcode.js";

export class QRCodeTabView extends BaseTabView {
    constructor(title) {
        super(title);
        this.pane = document.createElement('div');
        this.pane.classList.add('flex', 'flex-column', 'flex-grow-1', 'gap-5', 'overflow-y-scroll');

        this.inputTextArea = document.createElement('textarea');
        this.inputTextArea.classList.add('resize-none', 'flex-basis-1');
        this.inputTextArea.placeholder = '输入文本';

        this.qrcodeView = this.createQRCodeDom();
        this.settingView = this.createSettingDom();

        const btnGroupDiv = document.createElement('div');
        btnGroupDiv.classList.add('flex', 'flex-column', 'gap-5', 'flex-around');

        this.startBtn = document.createElement('button');
        this.startBtn.classList.add('btn');
        this.startBtn.innerText = '生成二维码';
        this.downloadBtn = document.createElement('button');
        this.downloadBtn.classList.add('btn');
        this.downloadBtn.innerText = '下载至本地';
        btnGroupDiv.append(this.startBtn, this.downloadBtn);

        const controlBox = document.createElement('div');
        controlBox.classList.add('flex', 'flex-row', 'flex-around', 'gap-5', 'user-select-none');
        controlBox.append(this.settingView, btnGroupDiv);

        this.pane.append(this.inputTextArea, controlBox, this.qrcodeView);

        this.startBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const str = this.inputTextArea.value;
            if (str) {
                const inputList = this.settingView.getElementsByClassName('error-correcting-level')[0].getElementsByTagName('input');
                let errorCorrectingLevel = 'L';
                for (let i = 0; i < inputList.length; i++) {
                    const input = inputList[i];
                    if (input.checked == true) {
                        errorCorrectingLevel = input.value;
                    }
                }
                const qrcodeImg = new QRCode({
                    msg: str,
                    dim:500,
                    ecl: errorCorrectingLevel,
                    pal: ["#000000", "#ffffff"]
                });
                this.qrcodeView.innerHTML = '';
                this.qrcodeView.append(qrcodeImg);
            }
        });
        this.downloadBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (this.qrcodeView.children.length <= 0) {
                return;
            }
            const svg = this.qrcodeView.children[0];
            console.log(svg.outerHTML);
            if (svg) {
                const fileName = `QRCode_${(new Date()).getTime()}.svg`; 
                const wsUrl = `ws://${window.location.hostname}:${window.location.port}`;
                const ws = new WebSocket(wsUrl);
                ws.addEventListener('open', (ev) => {
                    const msg = JSON.stringify({
                        action: 'download',
                        fileName: fileName, 
                        data: svg.outerHTML , 
                        dataType:'text'
                    });
                    ws.send(msg);
                })
                ws.addEventListener('message', (ev) => {
                    const res = JSON.parse(ev.data);
                    switch (res?.action) {
                        case 'download-res': {
                            const isOk = res?.isOk;
                            if (isOk) {
                                alert(fileName + '文件下载至下载目录');
                            } else {
                                alert('二维码文件下载失败');
                            }
                            ws.close();
                            break;
                        }
                        default:
                            break;
                    }
                });
            }
        });
    }

    createTabHtml() {
        // 设置元素的事件回掉
        return this.pane;
    }

    createQRCodeDom() {
        const qrcodeDiv = document.createElement('div');
        qrcodeDiv.classList.add('flex-grow-1', 'flex', 'flex-row', 'flex-center', 'user-select-none');
        return qrcodeDiv;
    }

    createSettingDom() {
        const settingDiv = document.createElement('div');
        settingDiv.classList.add('flex', 'flex-column', 'gap-5')
        settingDiv.innerHTML = `<div class="flex flex-column align-items-center">
                    <div>容错等级</div>
                    <div class='error-correcting-level flex flex-column align-items-center' >
                        <label><input type="radio" name="error-correction-level" value="L" checked>最低（7%）</label>
                        <label><input type="radio" name="error-correction-level" value="M">中等（15%）</label>
                        <label><input type="radio" name="error-correction-level" value="Q">质量（25%）</label>
                        <label><input type="radio" name="error-correction-level" value="H">最高（30%）</label>
                    </div>
                </div>`
        return settingDiv;
    }

}