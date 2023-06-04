function nextPage() {
    var elContinue = this.document.getElementById('nextbutton');
    var elPrevious = this.document.getElementById('prevbutton');
    var lastpage = true;

    if(elContinue != null) {
        lastpage = false;
    }
    
    chrome.runtime.sendMessage({islastpage: lastpage, cururl: window.location.href}, function(response) {});
    
    if(!lastpage) {
        elContinue.click();
    } else if(elPrevious != null){
        elPrevious.click(); // das hier ist nur getrickst mithilfe des Alerts am Ende. Geht wahrscheinlich normalerweise nicht.
    }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var origTablesDoc = document.getElementsByTagName('table');
    var origTablesList = [];
    for(var index = 0; index < origTablesDoc.length; index++) {
        if(origTablesDoc[index].innerHTML.includes('prevbutton') || 
            origTablesDoc[index].innerHTML.includes('nextbutton') || 
            origTablesDoc[index].innerHTML.includes('bottomprevbutton') || 
            origTablesDoc[index].innerHTML.includes('bottomnextbutton')){
            continue;
        }
        origTablesList.push(origTablesDoc[index]);
    }

    var solDoc = new DOMParser().parseFromString(message, 'text/html');
    var solTablesDoc = solDoc.getElementsByTagName('table');

    origTablesList.forEach(origTable => {
        var origParags = origTable.getElementsByTagName('p');

        for(var index = 0; index < origParags.length; index++) {
            var origPara = origParags[index];

            for(var index2 = 0; index2 < solTablesDoc.length; index2++) {
                var solTable = solTablesDoc[index2];
                var solParags = solTable.getElementsByTagName('p');

                for(var index3 = 0; index3 < solParags.length; index3++) {
                    var solPara = solParags[index3];

                    if(origPara.innerHTML == solPara.innerHTML) {
                        var parent = origTable.parentElement;

                        ///////////////////////////adding html fixes here///////////////////////////
                        var inputs = solTable.getElementsByTagName('input');
                        for(var f  = 0; f < inputs.length; f++) {
                            if(inputs[f].hasAttribute('checked') && inputs[f].getAttribute('checked') == 'checked') {
                                inputs[f].checked = true;
                            }
                        }
                        ////////////////////////////////////////////////////////////////////////////
                        
                        parent.replaceChild(solTable, origTable);
                        nextPage();
                    }
                }
            }
        }
    });
        //nextPage(); geht hier aber nicht
});