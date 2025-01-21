import { BaseTabView } from "../tabs.js";
import { utils } from "../utils.js";
import { apps } from "./router.js";


export class HomeTabView extends BaseTabView {
    constructor(title) {
        super(title);
        this.canClose = false;

        this.homePane = document.createElement('div');
        this.homePane.classList.add('pane', 'flex', 'flex-column', 'flex-grow-1', 'gap-5');

        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = '输入关键词筛选工具';

        this.appContent = document.createElement('div');
        this.appContent.classList.add('flex', 'flex-direction-row', 'flex-wrap', 'flex-evenly', 'gap-5', 'user-select-none');

        const searchBar = document.createElement('div');
        searchBar.classList.add('search-bar', 'flex', 'flex-center', 'flex-shrink-0');
        searchBar.append(this.searchInput);
        const appShowView = document.createElement('div');
        appShowView.classList.add('flex-grow-1', 'overflow-y-scroll');
        appShowView.style.height = '100px';
        appShowView.append(this.appContent);
        this.homePane.append(searchBar, appShowView);

        this.apps = apps; 

        for (const app of this.apps) {
            const btn = document.createElement('button');
            btn.classList.add('btn');
            btn.innerText = app.name;
            btn.setAttribute('js_path', app.jsPath); 
            // 设置按钮事件
            btn.addEventListener('click', (ev)=>{
                // console.log(btn.textContent);
                utils.sendSignal('open-tab', app.name, app.className); 
            }); 
            this.appContent.append(btn);
        }
        // 设置Search Input事件
        this.searchInput.addEventListener('input', (ev) => {
            this.updateAppBtnShow();
        });
    }

    createTabHtml() {
        // 设置元素的事件回掉
        return this.homePane;
    }

    /**
     * 更新App的按钮是否展示
     */
    updateAppBtnShow() {
        const input_str = this.searchInput.value;
        if (input_str == '') {
            // 空字符串，直接将所有按钮展示出来
            for (let i = 0; i < this.appContent.children.length; i++) {
                const btn = this.appContent.children[i];
                btn.classList.remove('display-none');
            }
        } else {
            // 输入了字符串，开始筛选
            for (let i = 0; i < this.appContent.children.length; i++) {
                const btn = this.appContent.children[i];
                const str = btn.textContent;
                if (str && str?.indexOf(input_str) >= 0) {
                    btn.classList.remove('display-none');
                }else{
                    btn.classList.add('display-none');
                }
            }
        }
    }
}