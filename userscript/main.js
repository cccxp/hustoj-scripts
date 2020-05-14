// ==UserScript==
// @name         HUSTOJ 魔改
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  魔改了一些HUSTOJ界面
// @author       shamisen
// @match        http://cise.sdust.edu.cn/OJ/contest.php*
// @match        http://cise.sdust.edu.cn/OJ/problem.php*
// @match        http://cise.sdust.edu.cn/OJ/contestrank.php*
// @match        http://cise.sdust.edu.cn/OJ/status.php*
// @match        http://cise.sdust.edu.cn/OJ/conteststatistics.php*
// @match        http://cise.sdust.edu.cn/OJ/ranklist.php*
// @match        http://cise.sdust.edu.cn/OJ/problemset.php
// @match        http://192.168.119.211/JudgeOnline/contest.php*
// @match        http://192.168.119.211/JudgeOnline/problem.php*
// @match        http://192.168.119.211/JudgeOnline/contestrank.php*
// @match        http://192.168.119.211/JudgeOnline/status.php*
// @match        http://192.168.119.211/JudgeOnline/conteststatistics.php*
// @match        http://192.168.119.211/JudgeOnline/problemset.php
// @require      https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js
// @require      https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js
// @require      https://cdn.bootcss.com/highlight.js/9.18.1/highlight.min.js
// @require      https://cdn.bootcss.com/clipboard.js/2.0.6/clipboard.min.js
// @require      https://cdn.bootcss.com/codemirror/2.36.0/codemirror.min.js
// @require      https://cdn.bootcss.com/codemirror/2.36.0/clike.min.js
// @grant        none
// ==/UserScript==


'use strict';

const options = {
    contestHighlight: "1/2" // contest.php中高亮匹配的contest名称，支持正则
    , rankHighlight: "202000000000" // status.php页面高亮对应学号+自动填写
    ,
}

function initClipboard(clipboard) {
    clipboard.on('success', function (e) {
        console.log("copied.");
        e.clearSelection();
        console.info('Text:', e.text);
        console.info("copied.");
    });
    clipboard.on('error', function (e) {
        alert("copy error.");
        console.error("err");
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
    });
}


// 添加 css 样式
document.querySelector("head").innerHTML += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
    + "<link href=\"https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css\" rel=\"stylesheet\">" // bootstrap
    + "<link href=\"https://cdn.bootcss.com/highlight.js/9.18.1/styles/xcode.min.css\" rel=\"stylesheet\">" // xcode
    + "<link href=\"https://cdn.bootcss.com/codemirror/2.36.0/codemirror.min.css\" rel=\"stylesheet\">"
    ;
// 结束

const maindiv = document.querySelector("#main");

// #main增加字号
maindiv.classList.add("container");
maindiv.style.fontSize = 18 + 'px';

// contest, contestrank, status 中的表格
document.querySelectorAll("#main > table").forEach((table) => {
    table.classList.add("table");
});

document.querySelectorAll("#main > center > table").forEach((table) => {
    table.classList.add("table");
});

if (document.URL.match("/contest.php$")) {
    // contest.php 中高亮匹配项目
    const rows = document.querySelectorAll("tr");
    for (let i = 0; i < rows.length; i++) {
        let a = rows[i].querySelector("td:nth-child(2) > a");
        if (a != null && a.innerHTML.match(options.contestHighlight)) {
            rows[i].className = "";
            let status = rows[i].querySelector("td:nth-child(3) > font");
            if (status.innerHTML.match("Running")) {
                // 正在进行的作业/考试高亮为红色
                a.innerHTML = "<b>" + a.innerHTML + "</b>";
                a.classList.add("alert-link");
                rows[i].classList.add("alert", "alert-danger");
            } else {
                // 结束的变为黄色
                rows[i].classList.add("alert", "alert-warning");
            }
        }
    }
}

if (document.URL.match("status.php")) {
    document.querySelector("#simform > input[type=text]:nth-child(2)").value = options.rankHighlight;
    const tb = document.querySelector("#main > table");
    const tr = tb.querySelectorAll("tr");
    for (let i = 0; i < tr.length; i++) {
        let auser = tr[i].querySelector("td:nth-child(2) > a");
        if (auser && auser.textContent.match(options.rankHighlight))
            tr[i].className = "";
        let status = tr[i].querySelector("td:nth-child(4)").textContent;
        if (status.match("Accepted")) {
            if (status.startsWith("*")) {
                tr[i].classList.add("alert", "alert-warning");
            }
            else {
                tr[i].classList.add("alert", "alert-success");
            }
        } else {
            tr[i].classList.add("alert", "alert-danger");
        }
    }
}

function generateCard(panelStyle, originNode, title) {
    let card = document.createElement("div");
    card.classList.add("panel");
    panelStyle.split(" ").forEach(element => {
        card.classList.add(element)
    });

    let cardTitle = document.createElement("div");
    cardTitle.classList.add("panel-heading")
    cardTitle.innerText = title;
    card.appendChild(cardTitle);

    let cardBody = document.createElement("div");
    cardBody.classList.add("panel-body");
    cardBody.appendChild(originNode)
    card.appendChild(cardBody);

    card.style.paddingLeft = "0px"
    card.style.paddingRight = "0px"

    return card;
}

function appendToRow(elements) {
    let row = document.createElement("div")
    row.classList.add("row")
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        row.appendChild(element)
    }
    return row
}

function addCopyButtom(targetElem, elemName, createPre = true) {
    if (createPre) {
        let pre = targetElem.querySelector("pre");
        pre.classList.add(elemName);
    }
    let copyButton = document.createElement("button");
    copyButton.classList.add("btn-sm", "btn-default");
    copyButton.setAttribute("data-clipboard-target", "." + elemName);
    copyButton.innerHTML = "copy";
    let clipboard = new ClipboardJS(copyButton);
    initClipboard(clipboard);
    targetElem.appendChild(copyButton);
}

if (document.URL.match("pid")) {
    // problem.php 及其相关
    // Sample Input / Output 重置为pre块
    const centerdivs = document.querySelectorAll("center");
    let samples = document.querySelectorAll(".sampledata");
    for (let i = 0; i < samples.length; i++) {
        var code = document.createElement("pre");
        code.innerHTML = samples[i].innerHTML;
        code.style["white-space"] = "pre";
        samples[i].parentNode.replaceChild(code, samples[i]);
    }
    let titles = document.querySelectorAll("#main > h2");
    for (let i = 0; i < titles.length; i++) {
        // console.log(titles[i].innerHTML);
        titles[i].parentNode.removeChild(titles[i]);
    }

    // 大量重构页面

    const contents = document.querySelectorAll("#main > .content");
    const description = contents[0];
    const input = contents[1];
    const output = contents[2];
    const sampleIn = contents[3];
    const sampleOut = contents[4];
    const hint = contents[5];
    const appendCodeDiv = contents[6];

    const rowHint = document.createElement("div");
    const rowAppendCode = document.createElement("div");

    let rowDesc = generateCard("panel-info row", description, "Description")
    maindiv.insertBefore(rowDesc, centerdivs[1]);

    let colPlaceHolder = document.createElement("div"); // col-md-1用处仅限让元素变为列，具体宽度会被后边设定的width覆盖掉
    colPlaceHolder.classList.add("col-md-1");
    let colInput = generateCard("panel-info col-md-6", input, "Input")
    let colOutput = generateCard("panel-info col-md-6", output, "Output")
    let rowInputOutput = appendToRow(new Array(colInput, colPlaceHolder, colOutput))
    maindiv.insertBefore(rowInputOutput, centerdivs[1]);

    colInput.style["text-align"] = "justify";
    colOutput.style["text-align"] = "justify";
    colInput.style["width"] = 45 + "%";
    colOutput.style["width"] = 45 + "%";
    colPlaceHolder.style["width"] = 10 + "%";

    let colSampleIn = generateCard("panel-primary col-md-1", sampleIn, "Sample Input")
    let colSampleOut = generateCard("panel-success col-md-1", sampleOut, "Sample Output")
    colPlaceHolder = document.createElement("div");
    colPlaceHolder.classList.add("col-md-1");
    let rowSampleIO = appendToRow(new Array(colSampleIn, colPlaceHolder, colSampleOut))
    maindiv.insertBefore(rowSampleIO, centerdivs[1]);

    colSampleIn.style["width"] = 45 + "%";
    colSampleOut.style["width"] = 45 + "%";
    colPlaceHolder.style["width"] = 10 + "%";

    rowHint.classList.add("row");
    hint.classList.add("alert", "alert-warning");
    hint.innerHTML = "<b>Hint: </b><br />" + hint.innerHTML;
    rowHint.appendChild(hint);
    maindiv.insertBefore(rowHint, centerdivs[1]);

    addCopyButtom(sampleIn, "sample_input")
    addCopyButtom(sampleOut, "sample_output")

    // 请求append code的代码并加到对应位置
    let appendCodes = appendCodeDiv.querySelectorAll("a");
    for (let i = 0; i < appendCodes.length; i++) {
        let url = appendCodes[i].href;
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', url, true);
        httpRequest.send();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                let parser = new DOMParser();
                let html = parser.parseFromString(httpRequest.responseText, "text/html");
                let preBlock = html.querySelector("pre");
                let codeBlock = document.createElement("code");
                codeBlock.innerHTML = preBlock.innerHTML;
                codeBlock.classList.add("language-cpp", "code_" + i);
                preBlock.innerHTML = "";
                preBlock.className = "";
                preBlock.style["background-color"] = "#ffffff";
                preBlock.appendChild(codeBlock);
                appendCodeDiv.appendChild(preBlock);
                addCopyButtom(appendCodeDiv, "code_" + i, false);
            }
        };
        // appendCodeURL[i].remove();
        hljs.initHighlightingOnLoad(); // 高亮
    }

    rowAppendCode.classList.add("row", "panel", "panel-default");
    let appendCodeTitle = document.createElement("div");
    appendCodeTitle.innerHTML = "Append Code:"
    appendCodeTitle.classList.add("panel-heading");
    appendCodeDiv.classList.add("panel-body");
    rowAppendCode.appendChild(appendCodeTitle);
    rowAppendCode.appendChild(appendCodeDiv);
    maindiv.insertBefore(rowAppendCode, centerdivs[1]);

    let langmask = "";
    let alinks = document.querySelectorAll("a");
    for (let i = 0; i < alinks.length; i++) {
        if (alinks[i].href && alinks[i].href.match("submitpage.php")) {
            let submitPageButton = alinks[i];
            submitPageButton.previousSibling.remove();
            submitPageButton.nextSibling.remove();
            submitPageButton.innerHTML = "Submit Page";
            submitPageButton.classList.add("btn", "btn-success");
            submitPageButton.style["margin"] = 15 + 'px';
            langmask = submitPageButton.href.match("langmask=([0-9]*)")[1];
        } else if (alinks[i].href && alinks[i].href.match("problemstatus.php")) {
            let statusButton = alinks[i];
            statusButton.nextSibling.remove();
            statusButton.classList.add("btn", "btn-info");
            statusButton.style["margin"] = 10 + 'px';
        }
    }

    // 添加提交框
    const rowSubmit = document.createElement("div");
    const submitHead = document.createElement("div");
    const submitBody = document.createElement("div");
    var submitContent = document.createElement("textarea");
    const langForm = document.createElement("select");
    const submitButton = document.createElement("button");

    rowSubmit.classList.add("row", "panel", "panel-primary");
    submitHead.classList.add("panel-heading");
    submitHead.innerHTML = "Submit";
    submitBody.classList.add("panel-body");
    submitContent.style["height"] = 200;
    submitButton.classList.add("btn", "btn-success");
    submitButton.style["margin"] = 10 + 'px';
    submitButton.innerHTML = "Submit";
    langForm.classList.add("form-control");
    langForm.style["margin"] = 10 + 'px';

    const languages = [
        "C",
        "C++",
        "Pasical",
        "Java",
        "Ruby",
        "Bash",
        "Python",
        "PHP",
        "Perl",
        "C#"
    ]
    // 根据submit按钮的URL中的langmask参数判断可提交语言
    // 参见 https://github.com/zhblue/hustoj/blob/master/trunk/web/submitpage.php
    langmask = ~parseInt(langmask);
    for (let i = 0; i < languages.length; i++) {
        if (1 << i & langmask) {
            console.log(languages[i]);
            const opt = document.createElement("option");
            opt.value = i;
            opt.text = languages[i];
            langForm.appendChild(opt);
        }
    }

    submitBody.appendChild(submitContent);
    submitBody.appendChild(langForm);
    submitBody.appendChild(submitButton);
    rowSubmit.appendChild(submitHead);
    rowSubmit.appendChild(submitBody);
    maindiv.insertBefore(rowSubmit, centerdivs[1]);

    const editor = CodeMirror.fromTextArea(submitContent, {
        mode: "text/x-c++src", // C++高亮
        lineNumbers: true,
        indentUnit: 4,
    });

    submitButton.onclick = function () {
        // 提交
        editor.save();
        const cid = document.URL.match("cid=([0-9]*)")[1];
        const pid = document.URL.match("pid=([0-9]*)")[1];
        const submitForm = document.createElement("form");
        submitForm.action = "submit.php";
        submitForm.method = "POST";
        submitForm.style.display = "none";
        const args = {
            "cid": cid,
            "pid": pid,
            "language": langForm.options[langForm.options.selectedIndex].value,
            "source": editor.getValue()
        }

        console.log(args);
        for (let k in args) {
            const opt = document.createElement("textarea");
            opt.name = k;
            opt.value = args[k];
            submitForm.appendChild(opt);
        }
        document.body.appendChild(submitForm);
        submitForm.submit();
    }

    document.querySelectorAll(".content").forEach((content) => {
        content.classList.remove("content"); // 去掉hoj.css提供的.content的样式
    });
}

maindiv.id = "n_main"; // 去掉hoj.css提供的#main的样式