import { Tabs, BaseTabView } from "./tabs.js";
import { HomeTabView } from "./tabviews/home.js";
import { utils } from "./utils.js";

async function main() {
    const tabs = new Tabs('main-tabs');

    const homeTab = new HomeTabView('首页');
    tabs.append(homeTab);
    tabs.selectById(homeTab.id);
    
    // 注册打开标签页的信号回调函数 
    utils.registerSignalCallFunc('open-tab', function (title, _class){
        const newTab = new _class(title);
        tabs.append(newTab);
        tabs.selectById(newTab?.id); 
    });
} main();
