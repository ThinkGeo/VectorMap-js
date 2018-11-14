const createTemplate = (dataTarget, styleName, subitems) =>
    `<li data-toggle="collapse" data-target="#${dataTarget}"  aria-expanded="true">
    <a href="#"  >${styleName}<span class="arrow"></span></a>
</li>
<ul id="${dataTarget}" class="sub-menu collapse nav" data-parent="#menu-bar">${createTemplateLi(subitems)}</ul>`;

const createTemplateLi = (subitems) => {
    let str = '';
    subitems.map((val) => {
        str += `<li><a href="#"><span class="sub-arrow">${val}</span></a>
        </li>`});
    return str;
}

const generatorMenubar = (data) => {
    let str = '';
    for (let obj of data) {
        let subitem = [];
        for (let sub of obj.subitems) {
            subitem.push(sub.title);
        }
        str += createTemplate(obj.dataTarget, obj.styleName, subitem);
    }
    $('#menu-bar').html(str);
    $('#menu-bar>ul:nth-child(2)').addClass('show');
    $('#menu-bar>ul:nth-child(2)>li:first-child').addClass('active');
}

export { generatorMenubar };