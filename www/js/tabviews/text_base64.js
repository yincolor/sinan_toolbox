import { BaseTabView } from "../tabs.js";
import { encode, decode } from "../lib/base64.min.mjs";

export class TextBase64TabView extends BaseTabView {
    constructor(title) {
        super(title);
        this.pane = document.createElement('div'); 
        this.pane.classList.add('flex', 'flex-column', 'flex-grow-1', 'gap-5', 'overflow-y-scroll');

        this.nomalTextArea = document.createElement('textarea'); 
        this.nomalTextArea.classList.add('resize-none', 'flex-basis-1', 'h-pt-100');
        this.nomalTextArea.placeholder = '普通的文本';
        
        this.base64TextArea = document.createElement('textarea'); 
        this.base64TextArea.classList.add('resize-none', 'flex-basis-1', 'h-pt-100');
        this.base64TextArea.placeholder = 'Base64编码文本';

        this.decodeBtn = document.createElement('button');
        this.decodeBtn.innerText = '解码';
        this.decodeBtn.classList.add('btn');
        this.decodeBtn.addEventListener('click', ()=>{
            const str = this.base64TextArea.value;
            if(str.length > 0){
                let decodeStr = '';
                let decodeStatus = false; 
                try {
                    decodeStr = decode(str);
                    decodeStatus = true;
                } catch (error) {
                    console.log('解码失败');
                    console.log(error);
                    decodeStatus = false; 
                }
                if(decodeStatus){
                    this.nomalTextArea.value = decodeStr; 
                }
            }
        });

        this.encodeBtn = document.createElement('button');
        this.encodeBtn.innerText = '编码';
        this.encodeBtn.classList.add('btn');

        this.encodeBtn.addEventListener('click', ()=>{
            const str = this.nomalTextArea.value;
            if(str.length > 0){
                let encodeStr = '';
                let encodeStatus = false; 
                try {
                    encodeStr = encode(str, false); 
                    encodeStatus = true;
                } catch (error) {
                    console.log('编码失败');
                    console.log(error);
                    encodeStatus = false; 
                }
                if(encodeStatus){
                    this.base64TextArea.value = encodeStr; 
                }
            }
        });

        const btnGroupDiv = document.createElement('div');
        btnGroupDiv.classList.add('flex-basis-0', 'flex', 'flex-around', 'user-select-none')
        btnGroupDiv.append(this.encodeBtn, this.decodeBtn);
        this.pane.append(this.nomalTextArea, btnGroupDiv, this.base64TextArea); 
        
    }

    createTabHtml() {
        // 设置元素的事件回掉
        return this.pane;
    }
    
}