

export class Tabs {
    constructor(tab_id) {
        this.tab = document.getElementById(tab_id);
        
        this.nav = this.tab.getElementsByClassName('nav')[0]
        this.linkList = this.nav.getElementsByClassName('link-list')[0];
        this.tabLeftMoveBtn = this.nav.getElementsByClassName('left-move')[0];
        this.tabRightMoveBtn = this.nav.getElementsByClassName('right-move')[0];

        this.navControler = this.tab.getElementsByClassName('nav')[0].getElementsByClassName('link-controler')[0];
        this.content = this.tab.getElementsByClassName('content')[0];
        /**
         * 标签页对象列表
         * @type {BaseTabView[]}
         */
        this.tabviews = [];
        this.selectId = null;

        this.tabLeftMoveBtn.addEventListener('click', (ev)=>{
            ev.stopPropagation();
            // console.log('点击了向左移动按钮', this.linkList.children[0].style.display);
            for(let i=0;i<this.linkList.children.length;i++){
                const link = this.linkList.children[i]; 
                if(link.style.display == 'none'){
                    continue;
                }else {
                    link.style.display = 'none'; 
                    break;
                }
            }
        });
        this.tabRightMoveBtn.addEventListener('click', (ev)=>{
            ev.stopPropagation();
            // console.log('点击了向右移动按钮', this.linkList.children);
            for(let i=this.linkList.children.length - 1;i>=0;i--){
                const link = this.linkList.children[i]; 
                if(link.style.display == 'none'){
                    link.style.display = 'flex';
                    break;
                }else {
                    continue; 
                }
            }
        });
    }

    static nextFreeId = 0; // 将0作为第一个可以使用的id号
    /** 获取一个空闲的ID */
    static getId() {
        return this.nextFreeId++;
    }

    /**
     * 将一个标签页对象放入，更新
     * @param {BaseTabView} tabView 
     */
    append(tabView) {
        // 初始化标签页
        let status = false;
        if (tabView.isInited() == false) {
            status = tabView.init();
        } else {
            if (tabView.dom) {
                status = true;
            } else {
                status = false;
            }
        }
        // console.log(tabView.dom);
        
        if (status) {
            // 将标签页纳入列表中
            // console.log(`${tabView.title} 标签页对象初始化成功`);
            this.tabviews.push(tabView);
            // 更新
            const navLink = this.createNavLinkDom(tabView);
            this.linkList.append(navLink);
            const contentItem = this.createContentItemDom(tabView);
            this.content.append(contentItem);
        } else {
            // console.log(`标签页对象初始化失败`);
            return false;
        }
        return true;
    }

    /**
     * 创建一个标签页的选项卡
     * @param {BaseTabView} tabView 
     */
    createNavLinkDom(tabView) {
        const linkDiv = document.createElement('div');
        linkDiv.classList.add('link');
        const linkNameSpan = document.createElement('span');
        linkNameSpan.innerText = tabView.title;
        linkDiv.append(linkNameSpan);
        linkDiv.setAttribute('tab_id', tabView.id);

        const closeA = document.createElement('a');
        if (tabView.canClose) {
            closeA.innerHTML = `<svg viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet"><line x1="0" x2="32" y1="0" y2="32" stroke="black"  stroke-width="4"/><line x1="32" x2="0" y1="0" y2="32" stroke="black"  stroke-width="4"/></svg>`;
            linkDiv.append(closeA);
            closeA.addEventListener('click', (ev) => {
                ev.stopPropagation();  
                this.closeTabView(tabView); 
            });
        }
        linkDiv.addEventListener('click', (ev)=>{
            // console.log(ev.target == a || ev.target == a.children[0]);
            if(ev.currentTarget == linkDiv && !(ev.target == closeA || ev.target == closeA.children[0])){
                // console.log(`切换显示 show id=${tabView.id}`);
                this.selectById(tabView.id); 
            }else {
                // console.log(ev.currentTarget); 
            }
        })
        return linkDiv;
    }
    /**
     * 创建一个标签页的内容区域
     * @param {BaseTabView} tabView 
     * @returns 
     */
    createContentItemDom(tabView){
        const contentItem = document.createElement('div');
        contentItem.setAttribute('tab_id', tabView.id);
        contentItem.classList.add('item');
        contentItem.append(tabView.dom); 
        return contentItem; 
    }

    /**
     * 设置被选中的标签页
     * @param {Number} tabViewId
     */
    selectById(tabViewId) {
        const newSelectId = tabViewId;
        
        if (newSelectId || newSelectId == 0) {
            // console.log(`将要选中的ID为：${newSelectId}`);
            this.selectId = newSelectId;
            // 将nav的标签头置为被选中
            for (let i = 0; i < this.linkList.children.length; i++) {
                const curTabId = Number(this.linkList.children[i].getAttribute('tab_id'));
                if (curTabId == this.selectId) {
                    this.linkList.children[i].classList.add('select');
                    // console.log('显示：', this.linkList.children[i]);
                    
                }else{
                    this.linkList.children[i].classList.remove('select');
                }
            }
            // 将content对象里对应的item设置class为select
            for (let i = 0; i < this.content.children.length; i++) {
                const curTabId = Number(this.content.children[i].getAttribute('tab_id'));
                if (curTabId == this.selectId) {
                    this.content.children[i].classList.add('select');
                    // console.log('显示：', this.content.children[i]);
                }else{
                    this.content.children[i].classList.remove('select');
                }
            }
        } else {
            return false;
        }
        return true; 
    }

    /**
     * 根据id获取tabView对象
     * @param {Number} tabId 
     * @returns 
     */
    getTabViewById(tabId){
        for(const tv of this.tabviews){
            if(tv.id == tabId){
                return tv;
            }
        }
        return null; 
    }

    /**
     * 
     * @param {BaseTabView} tabView 
     */
    closeTabView(tabView) {
        // console.log(`要关闭标签页：${tabView.title} id=${tabView.id}`);
        // console.log(this.tabviews);
        const removeId = tabView.id; 
        const removeTabViewIndex = this.removeTabViewsById(removeId); 
        this.removeNavLinkById(removeId); 
        this.removeContentItemById(removeId);
        // console.log(this.tabviews);
        // 将被删除对象的左边的对象设置展示
        this.selectById(this.tabviews[removeTabViewIndex - 1].id); 
        // console.log('select index = ', (removeTabViewIndex - 1), this.tabviews[removeTabViewIndex - 1]);
        

    }
    removeTabViewsById(tabId){
        let i = 0;
        for(;i<this.tabviews.length;i++){
            const tabview = this.tabviews[i];
            if(tabview.id == tabId){
                // console.log(`删除第${i}个元素`);
                this.tabviews.splice(i,1);
                break; 
            }
        }
        return i; 
    }
    removeNavLinkById(tabId){
        for(let i=0;i<this.linkList.children.length;i++){
            const link = this.linkList.children[i];
            const curTabId = Number(link.getAttribute('tab_id'));;
            // console.log(curTabId);
            if(curTabId == tabId){
                // console.log(`删除 id=${curTabId} 节点`);
                this.linkList.removeChild(link); 
                break; 
            }
        }
    }
    removeContentItemById(tabId){
        for(let i=0;i<this.content.children.length;i++){
            const item = this.content.children[i];
            const curTabId = Number(item.getAttribute('tab_id'));
            // console.log(curTabId);
            
            if(curTabId == tabId){
                // console.log(`删除 id=${curTabId} 节点`);
                this.content.removeChild(item); 
                break; 
            }
        }
    }
}

/**
 * 标签页对象基类
 */
export class BaseTabView {
    constructor(title) {
        this.id = Tabs.getId();
        this.title = title;
        // this.moduleDir = utils.getModuleDir(module_url); // 获取模块的路径 
        this.dom = null;
        this.canClose = true; // 是否可以被关闭
        this.inited = false;
    }

    /** 数据初始化 */
    init() {
        this.inited = true;
        this.dom = this.createTabHtml();
        if (this.dom) {
            return true;
        } else {
            return false;
        }
    }
    /** 判断是否已经初始化了 */
    isInited() { return this.inited; }

    /** 获取标签页Html */
    createTabHtml() {
        // const doc = await utils.getHtml(this.moduleDir + 'template.html');
        // const dom = doc.getElementsByTagName('template')[0]?.content?.cloneNode(true);
        const dom = document.createElement('div');
        dom.classList.add('pane'); 
        dom.innerText = 'BaseTabView'; 
        if (dom) {
            return dom;
        } else {
            return null;
        }
    }

    send(){

    }
}
