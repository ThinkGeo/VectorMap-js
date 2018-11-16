import menuData from './data';
import sidebarClickHandle from './index';
import { generatorMenubar } from './sidebarTemplate'
let searchMenu = (inputValue) => {
    let data = [];
    if (inputValue.search(/^\S+$/g)) {
        generatorMenubar(menuData);
    } else {
        for (let obj of menuData) {
            let re = new RegExp(`${inputValue}`, 'i');
            if (obj.styleName.search(re) === -1) {//father fail
                const newObj = {
                    dataTarget: '',
                    styleName: '',
                    subitems: []
                }
                for (let child of obj.subitems) {
                    if (child.title.search(re) !== -1) {//child success
                        newObj.dataTarget = obj.dataTarget;
                        newObj.styleName = obj.styleName;
                        newObj.subitems.push(child);
                    }
                }
                if (newObj.dataTarget && newObj.styleName) {
                    data.push(newObj);
                }
            } else {
                data.push(obj);
            }
        }
        generatorMenubar(data);
    }
    sidebarClickHandle();
}

export { searchMenu }