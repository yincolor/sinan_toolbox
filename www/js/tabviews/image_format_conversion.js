import { BaseTabView } from "../tabs.js";

export class ImageFormatConversionTabView extends BaseTabView {
    constructor(title) {
        super(title);
        this.pane = document.createElement('div'); 
        this.pane.classList.add('flex', 'flex-column', 'flex-grow-1', 'gap-5', 'overflow-y-scroll');

        const fileInputDiv = this.createFileInputDom(); 
        const outConfDiv = this.createOutConfDom(); 
        this.startBtn = document.createElement('button');
        this.startBtn.innerText = '开始转换'; 
        this.startBtn.classList.add('btn'); 
        this.pane.append(fileInputDiv, outConfDiv, this.startBtn); 
    }

    createTabHtml() {
        // 设置元素的事件回掉
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
                <label class='align-items-center'><input type="radio" name="image_type_format" value="png">.png</label>
                <label class='align-items-center'><input type="radio" name="image_type_format" value="jpg">.jpg</label>`;
        const fileOutConfDiv = document.createElement('div');
        fileOutConfDiv.classList.add('flex', 'flex-row', 'gap-5', 'align-items-center');
        fileOutConfDiv.innerHTML = str; 
        return fileOutConfDiv; 
    }
}