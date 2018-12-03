const childPageTemplate = ` <div id="child-page-title">
    <h1></h1>
    <p><p>
</div>
<ul class="nav nav-tabs" id="child-page-component" role="tablist">
     <li class="nav-item map">
        <a class="nav-link active"  data-toggle="tab" href="#child-page-view">View</a>
    </li>
      <li class="nav-item html">
        <a class="nav-link"  data-toggle="tab" href="#child-page-html">Html</a>
    </li>
      <li class="nav-item js mr-auto">
        <a class="nav-link"  data-toggle="tab" href="#child-page-js">JavaScript</a>
    </li>
    <li class="nav-item" id="codepen">
      <a  class="nav-link" href="https://codepen.io" target="_blank">
        Open in: 
        <img src="./image/edit-icon.png">
       </a>
    </li>
</ul>
<div class="tab-content">
    <div id="child-page-view" class="tab-pane fade show active">
        <iframe src="" frameborder=0 height=100% width=100% align=center></iframe>
    </div>
    <div id="child-page-html" class="tab-pane fade">
    </div>
    <div id="child-page-js" class="tab-pane fade">
    </div>
</div>
</div>`;
const addChildPage = (ele) => {
    ele.innerHTML = childPageTemplate;
}
const ShowHandleFuns = class {
    constructor(childPageObj) {
        this.htmlPath = childPageObj.htmlPath;
        this.jsPath = childPageObj.jsPath;
        this.title = childPageObj.title;
        this.comments = childPageObj.comments;
        document.querySelector('#child-page-title>h1').innerText = this.title;
        document.querySelector('#child-page-title>p').innerText = this.comments;
    }

    showCodeFun(div, path) {
        fetch(path, {
            method: 'GET'
        }).then(function (res) {
            if (res.ok) {
                res.blob().then((data) => {
                    let reader = new FileReader();
                    reader.addEventListener('loadend', () => {
                        let str = reader.result;
                        str = str.replace(/\</gm, '&lt;');
                        str = str.replace(/\>/gm, '&gt;');
                        let preCode = `<pre style="height: ${window.innerHeight - 200}px"><code> ${str}
                              </code></pre>`;
                        div.innerHTML = preCode;
                        (() => {
                            $('pre code').each(function () {
                                let lines = $(this).text().split('\n').length - 1;
                                if (lines < 4) return;
                                let $numbering = $('<ol/>').addClass('pre-numbering');
                                $(this)
                                    .addClass('has-numbering')
                                    .parent()
                                    .append($numbering);
                                for (let i = 1; i <= lines; i++) {
                                    $numbering.append($('<li/>').text(i));
                                }
                            });
                        })();
                        $(div).each(function (i, e) {
                            hljs.highlightBlock(e, null, true);
                        });
                    });
                    reader.readAsText(data);
                });
            } else {
                console.log("Looks like the response wasn't perfect, got status", res.status);
            }
        }, function (e) {
            console.log("Fetch failed!", e);
        });
    }

    showHtmlViewFun(viewDiv) {
        viewDiv.querySelector('iframe').src = this.htmlPath;
    }

    showHtmlCodeFun(htmlDiv) {
        this.showCodeFun(htmlDiv, this.htmlPath)
    }

    showJsCodeFun(jsDiv) {
        this.showCodeFun(jsDiv, this.jsPath)
    }
};
/**
 * loadChildPage({
    title: 'Title',
    htmlPath: 'http://ap.thinkgeo.com:9205/areaStyle.html',
    jsPath: 'pages/stylejson/areastyle/bundle.js'
    });
 */
const loadChildPage = (childPageObj) => {
    if (!childPageObj.htmlPath || !childPageObj.jsPath) {
        alert('html path or js path is not right!');
        return;
    }
    //for queryselect
    const [viewDivId, htmlDivId, jsDivId] = ['#child-page-view', '#child-page-html', '#child-page-js'];
    const [viewDiv, htmlDiv, jsDiv] = [document.querySelector(viewDivId),
        document.querySelector(htmlDivId),
        document.querySelector(jsDivId)
    ];

    const showHandlefun = new ShowHandleFuns(childPageObj);
    const childPageClickButtonsParent = document.querySelector('#child-page-component');
    const navLinkArr = childPageClickButtonsParent.querySelector('.nav-link.active');
    switch (navLinkArr.text) { //judge which page is shown, update the view or code in the .tab-pane
        case 'View':
            {
                showHandlefun.showHtmlViewFun(viewDiv);
            }
        case 'Html':
            {
                showHandlefun.showHtmlCodeFun(htmlDiv);
            }
        case 'JavaScript':
            {
                showHandlefun.showJsCodeFun(jsDiv);
            }
    }
    $('.nav-item.map').on('shown.bs.tab', function (e) {
        showHandlefun.showHtmlViewFun(viewDiv);
    });
    $('.nav-item.html').on('shown.bs.tab', function (e) {
        showHandlefun.showHtmlCodeFun(htmlDiv);
    });
    $('.nav-item.js').on('shown.bs.tab', function (e) {
        showHandlefun.showJsCodeFun(jsDiv);
    });
};

export {
    addChildPage,
    loadChildPage
};