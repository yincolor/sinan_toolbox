import { BaseTabView } from "../tabs.js";
import { SparkMD5 } from "../lib/spark-md5.min.mjs";

export class MD5TabView extends BaseTabView {
    constructor(title) {
        super(title);
        this.pane = document.createElement('div');
        this.pane.classList.add('flex', 'flex-column', 'flex-grow-1', 'gap-5', 'overflow-y-scroll');

        this.typeSelectDiv = this.createTypeSelectDom();

        this.textInput = document.createElement('textarea');
        this.textInput.classList.add('resize-none', 'flex-basis-1', 'h-pt-100');

        const fileDiv = this.createFileInputDom();
        this.fileInput = fileDiv.getElementsByTagName('input')[0];

        this.startBtn = document.createElement('button');
        this.startBtn.classList.add('btn');
        this.startBtn.innerText = '开始计算';

        this.outLine = document.createElement('input');
        this.outLine.type = 'text';

        this.pane.append(this.typeSelectDiv, this.textInput, fileDiv, this.startBtn, this.outLine);

        /** 设置更新输入类型 */
        this.typeSelectDiv.addEventListener('click', (ev) => {
            ev.stopPropagation();
            this.updateTypeViewDisplay()
        });
        this.updateTypeViewDisplay();

        this.startBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const typeName = this.getInputType();
            if (typeName == 'text') {
                const str = this.textInput.value;
                if (str.length > 0) {
                    const resStr = SparkMD5.hash(str);
                    this.outLine.value = resStr;
                } else {
                    alert('输入框内容长度为0');
                    return;
                }
            } else if (typeName == 'file') {
                const files = this.fileInput.files;
                if (!files) {
                    alert('没有文件，files is null ');
                    return;
                }
                if (files && files.length <= 0) {
                    alert('没有文件，files len is 0 ');
                    return;
                }
                this.startBtn.disabled = true; /*禁用按钮点击*/
                const btnText = this.startBtn.innerText;
                const newBtnText = '正在计算中...';
                this.startBtn.innerText = newBtnText;
                const file = files[0];
                const chunkSize = 6291456; // Read in chunks of 6MB
                const chunks = Math.ceil(file.size / chunkSize);
                let currentChunk = 0;
                const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
                const spark = new SparkMD5.ArrayBuffer();

                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                    // console.log('read chunk nr', currentChunk + 1, 'of', chunks);
                    spark.append(e.target.result);                   // Append array buffer
                    currentChunk++;

                    if (currentChunk < chunks) {
                        this.startBtn.innerText = newBtnText + ` ${currentChunk}/${chunks}`
                        loadNext();
                    } else {
                        console.log('finished loading');
                        const resStr = spark.end(); 
                        console.info('computed hash', resStr);  // Compute hash
                        this.outLine.value = resStr;
                        this.startBtn.innerText = btnText;
                        this.startBtn.disabled = false; /*启用按钮点击*/
                    }
                };

                fileReader.onerror =  () => {
                    console.warn('oops, something went wrong.');
                    this.startBtn.innerText = btnText;
                    this.startBtn.disabled = false; /*启用按钮点击*/
                };

                function loadNext() {
                    var start = currentChunk * chunkSize,
                        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

                    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
                }

                loadNext();

            } else {
                return;
            }
        });
    }

    createTabHtml() {
        // 设置元素的事件回掉
        return this.pane;
    }

    createTypeSelectDom() {
        const calcInputTypeDiv = document.createElement('div');
        calcInputTypeDiv.classList.add('flex', 'flex-row', 'align-items-center', 'user-select-none');

        const textDiv = document.createElement('div');
        const textTypeInput = document.createElement('input');
        textTypeInput.type = 'radio';
        textTypeInput.name = 'md5-calc-type';
        textTypeInput.setAttribute('type-name', '字符串');
        textTypeInput.checked = true;

        const textTypeLabel = document.createElement('label');
        textTypeLabel.append(textTypeInput, '字符串');

        textDiv.append(textTypeLabel);

        const fileDiv = document.createElement('div');
        const fileTypeInput = document.createElement('input');
        fileTypeInput.type = 'radio';
        fileTypeInput.name = 'md5-calc-type';
        fileTypeInput.setAttribute('type-name', '文件');
        fileTypeInput.checked = false;

        const fileTypeLabel = document.createElement('label');
        fileTypeLabel.append(fileTypeInput, '文件');
        fileDiv.append(fileTypeLabel);

        calcInputTypeDiv.append('选择输入类型：', textDiv, fileDiv);
        return calcInputTypeDiv;
    }
    createTextInputDom() {
        const textInput = document.createElement('textarea');
        textInput.classList.add('resize-none', 'flex-basis-1', 'h-pt-100');
        return textInput;
    }
    createFileInputDom() {
        const div = document.createElement('div');

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.classList.add('display-none');
        // console.log(`当前文件`, fileInput.files);


        const fileClickBtn = document.createElement('button');
        fileClickBtn.classList.add('btn');
        fileClickBtn.innerText = '选择文件';
        const span = document.createElement('span');
        span.style.overflowX = 'hidden';

        fileClickBtn.addEventListener('click', (ev) => {
            fileInput.click();

        });
        fileInput.addEventListener('change', (ev) => {
            // console.log(`当前文件`, fileInput.files);
            span.innerText = ev.currentTarget.files[0].name;
        });

        div.append(fileInput, fileClickBtn, span);
        return div;
    }

    /** 根据单选的类型决定显示哪种输入框 */
    updateTypeViewDisplay() {
        const typeName = this.getInputType();
        if (typeName == 'text') {
            this.textInput.classList.remove('display-none');
            this.fileInput.parentElement.classList.add('display-none');
        } else if (typeName == 'file') {
            this.textInput.classList.add('display-none');
            this.fileInput.parentElement.classList.remove('display-none');
        } else {
            console.log(`切换显示的输入失败`);
        }
    }

    /** 获取选择的类型 */
    getInputType() {
        const input_list = this.typeSelectDiv.getElementsByTagName('input');
        for (let i = 0; i < input_list.length; i++) {
            const input = input_list[i];
            if (input.type == 'radio') {
                if (input.checked == true) {
                    const typeName = input.getAttribute('type-name');
                    if (typeName == '字符串') {
                        return 'text';
                    } else if (typeName == '文件') {
                        return 'file';
                    } else {
                        console.log(`错误的type-name属性值: ${typeName}`);
                        continue;
                    }
                } else {
                    continue;
                }
            } else {
                continue;
            }
        }
        return null;
    }
}