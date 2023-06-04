var elContinue = this.document.getElementById('nextbutton');
var lastpage = true;
var page = '<html><head>';

var imgnodes = document.getElementsByClassName("ilTestMarkQuestionIcon");
for(index = 0; index < imgnodes.length; index++) {
    imgnodes[index].remove();
}

var linknodes = document.getElementsByTagName("link");
for(index = 0; index < linknodes.length; index++) {
    var node = linknodes[index];
    if(node.rel == "stylesheet") {
        page += '<link rel="stylesheet" type="text/css" href="' + node.href + '">'
    }
}

page += '</head><body>';

var tables = document.getElementsByTagName('table');

for (index = 0; index < tables.length; index++) { 
    var code = tables[index].outerHTML;
    if(code.includes('prevbutton') || code.includes('nextbutton') || code.includes('bottomprevbutton') || code.includes('bottomnextbutton')) {
        continue;
    }
    page = page + code;
} 

page = page + '</body></html>';

if(elContinue != null) {
    lastpage = false;
}

chrome.runtime.sendMessage({parcel: page, islastpage: lastpage, cururl: window.location.href}, function(response) {});

if(elContinue != null) {
    elContinue.click();
}