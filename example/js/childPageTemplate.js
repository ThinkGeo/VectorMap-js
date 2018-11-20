const childPageTemplate = ` <div id="child-page-title">
    <h4></h4>
</div>
<ul class="nav nav-tabs" id="child-page-component" role="tablist">
     <li class="nav-item">
        <a class="nav-link active"  data-toggle="tab" href="#child-page-view">View</a>
    </li>
      <li class="nav-item">
        <a class="nav-link "  data-toggle="tab" href="#child-page-html">Html</a>
    </li>
      <li class="nav-item mr-auto">
        <a class="nav-link "  data-toggle="tab" href="#child-page-js">JavaScript</a>
    </li>
    <li class="nav-item">
      <a  class="nav-link" href="https://codepen.io" target="_blank">
        <img src="./images/edit-icon.png">
        Edit</a>
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
        let childPageClickButtonsParent = document.querySelector('#child-page-component');
        document.querySelector('#child-page-title>h4').innerText = this.title;
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
    document.querySelector(jsDivId)];

    const showHandlefun = new ShowHandleFuns(childPageObj);

    showHandlefun.showHtmlViewFun(viewDiv);
    const childPageClickButtonsParent = document.querySelector('#child-page-component');
    childPageClickButtonsParent.addEventListener('click', (event) => {
        let eleAHerf = event.target.getAttribute('href');
        switch (eleAHerf) {
            case viewDivId: {
                showHandlefun.showHtmlViewFun(viewDiv);
                break;
            }
            case htmlDivId: {
                showHandlefun.showHtmlCodeFun(htmlDiv)
                break;
            }
            case jsDivId: {
                showHandlefun.showJsCodeFun(jsDiv);
                break;
            }
            default: {
                return;
            }
        }
    });
}

export { addChildPage, loadChildPage };