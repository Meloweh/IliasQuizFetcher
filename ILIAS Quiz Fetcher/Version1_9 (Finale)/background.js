'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'ilias.hs-heilbronn.de'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

var prevurl = null;
var firsturl = null;
var content = '';
var prevcontent = '';
var curcontent = '';
var TOOLMODE = 0;
var solutionCode = null;
var singleFetchCounter = 0;

function executeAsync(func) {
  setTimeout(func, 0);
}

function injectFetching(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if(tabs[0].url != prevurl) {

      content = content + curcontent;
      prevcontent = curcontent;
      prevurl = tabs[0].url;

      chrome.tabs.executeScript(
        tabs[0].id,
        {file: 'injectionSingleFetch.js'}, function() {
          chrome.tabs.executeScript(
            tabs[0].id,
            {code: 'var elContinue = this.document.getElementById("nextbutton"); var lastpage = true; if(elContinue != null) {lastpage = false;} chrome.runtime.sendMessage({parcel: page, islastpage: lastpage, cururl: window.location.href}, function(response) {}); if(elContinue != null) {elContinue.click();}'}, function() {
                            
            }
          );
        }
      );
    } else {
      executeAsync(injectFetching);
    }
  });
}

function injectAutoSolution() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if(tabs[0].url != prevurl) {
      prevcontent = curcontent;
      prevurl = tabs[0].url;

      chrome.tabs.executeScript(
        tabs[0].id,
        {file: 'sourceInjection.js'}, function() {
          chrome.tabs.sendMessage(tabs[0].id, solutionCode);
        }
      );
    } else {
      executeAsync(injectAutoSolution);
    }
  });
}

function injectRedirect(newurl){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: 'window.location.href = "' + newurl + '";'}
    );
  });
}

function injectSingleFetch() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {file: 'injectionSingleFetch.js'}, function() {
        chrome.tabs.executeScript(
          tabs[0].id,
          {code: 'chrome.runtime.sendMessage({parcel: page}, function(response) {});'}, function() {
    
          }
        );
      }
    );
  });
}

function clearAttributes() {
  prevurl = null;
  content = '';
  prevcontent = '';
  curcontent = '';
  firsturl = null;
  solutionCode = null;
  TOOLMODE = 0;
}

function fillFirstUrlIfEmpty(fromRequest) {
  if(firsturl == null) {
    prevurl = fromRequest;
    firsturl = fromRequest;
  }
}

function goToFirstPageAndClear() {
  injectRedirect(firsturl);
  clearAttributes();
}

function downloadRelative(path, data) {
  var blob = new Blob([data], {type: "js/plain"});
  var url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: path
  });
}

function injectRetrieveShared() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      //{code: 'var page = document.outerHTML; chrome.runtime.sendMessage({parcel: page}, function(response) {});'}, function() {
        {file: 'injectionRetrieveShared.js'}, function() {
      }
    );
  });
}

/*
function requestNextViewToPageNumber(num, maxnum, page) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", chrome.extension.getURL ("pagedata/page" + num + ".html"), true );
  xmlHttp.send( null );
  xmlHttp.onload = function() {
      num++;

      
      //if(xmlHttp.responseText != null) {
      //  page += xmlHttp.responseText;
      //}

      if(maxnum >= num) {
        requestNextViewToPageNumber(num, maxnum, page);
      } else {
        var newwindow = window.open();
        newwindow.document.write(page);
      }
  }
}*/

function recursiveFetch(num, fetchedcounter, pagecount, maxnum, page) {

  if(num > maxnum) {
    return;
  }

  var currenturl = "pagedata/page" + num + ".html";
  num++;
  alert(currenturl)

  chrome.runtime.getPackageDirectoryEntry(function(storageRootEntry) {
    fileExists(storageRootEntry, currenturl, function(isExist) {
      if(isExist) {
        alert('f');
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", chrome.extension.getURL (currenturl), true );
        xmlHttp.send( null );
        xmlHttp.onload = function() {
          alert(num);
          alert(fetchedcounter);
          page += xmlHttp.responseText;
          fetchedcounter++;

          if(fetchedcounter == pagecount) {
            var newwindow = window.open();
            newwindow.document.write(page);
          } else {
            recursiveFetch(num, fetchedcounter, pagecount, maxnum, page);
          }
        }
      } else {
        recursiveFetch(num, fetchedcounter, pagecount, maxnum, page);
      }
    });
  });
  /*
  if(num == maxnum) {
    var newwindow = window.open();
    newwindow.document.write(page);
  } else {
    num++;
    recursiveFetch(num, maxnum, page);
  }*/
}

function fileExists(storageRootEntry, fileName, callback) {
  storageRootEntry.getFile(fileName, {
    create: false
  }, function() {
    callback(true);
  }, function() {
    callback(false);
  });
}

/*TODO: fix promise with error handling*/
chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {

    if(request.singlefetcher == "fetchsingle") {
      injectSingleFetch();
      TOOLMODE = 2;
      return; 
    } 

    if(TOOLMODE == 2) {
      downloadRelative("queue/page" + singleFetchCounter + ".html", request.parcel);
      singleFetchCounter++;
      TOOLMODE = 0;
      return;
    }

    if(request.singlefetcher == "openshared") {
      
      var xmlHttp = null;
      var page = '';
      xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", chrome.extension.getURL ("pagedata/maxpagenumber.html"), true );
      xmlHttp.send( null );
      xmlHttp.onload = function() {
        if(xmlHttp != null && xmlHttp.responseText != null && xmlHttp.responseText.length >= 1) {
          var maxpage = parseInt(xmlHttp.responseText);
          
          xmlHttp = new XMLHttpRequest();
          xmlHttp.open( "GET", chrome.extension.getURL ("pagedata/pagecount.html"), true );
          xmlHttp.send( null );
          xmlHttp.onload = function() {
            if(xmlHttp != null && xmlHttp.responseText != null && xmlHttp.responseText.length >= 1) {
              var pagecount = parseInt(xmlHttp.responseText);
              alert(pagecount);
              recursiveFetch(1, 0, pagecount, maxpage, '');
            }
          }
          
          
          /*
            chrome.runtime.getPackageDirectoryEntry(function(storageRootEntry) {
              var page = ';';
              for(var i = 1; i <= maxpage; i++) {
                fileExists(storageRootEntry, "pagedata/page" + i + ".html", function(isExist) {
                  if(isExist) {
                    var feedback = false;

                    xmlHttp = new XMLHttpRequest();
                    xmlHttp.open( "GET", chrome.extension.getURL ("pagedata/page" + i + ".html"), true );
                    xmlHttp.send( null );
                    xmlHttp.onload = function() {
                      page += xmlHttp.responseText;
                      feedback = true;
                        //if(xmlHttp.responseText != null) {
                          //page += xmlHttp.responseText;
                          //alert(xmlHttp.responseText);
                        //}
                        alert('f');
                    }
                    while(!feedback);
                    alert(xmlHttp.responseText);
                  }
                });
              }

              var newwindow = window.open();
              newwindow.document.write(page);
            });*/
            
            /*
            xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", chrome.extension.getURL ("pagedata/page" + i + ".html"), false );
            xmlHttp.send( null );
            xmlHttp.onload = function() {
                if(xmlHttp.responseText != null) {
                  page += xmlHttp.responseText;
                  alert(xmlHttp.responseText);
                }
            }

            var newwindow = window.open();
            newwindow.document.write(page);*/
          //}
          //requestNextViewToPageNumber(1, maxpage, '');

          /*
          xmlHttp = new XMLHttpRequest();
          xmlHttp.open( "GET", chrome.extension.getURL ("pagedata/pagecount.html"), true );
          xmlHttp.send( null );
          xmlHttp.onload = function() {
            var pagecount = parseInt(xmlHttp.responseText);
            var fetchiteration = 0;

            while(fetchiteration != pageiteration) {

            }
          }*/
        }
      }
      return;
    }

    if(TOOLMODE == 0 && request.parcel != null) {

      fillFirstUrlIfEmpty(request.cururl);

      curcontent = request.parcel;

      if(!request.islastpage) {
        executeAsync(injectFetching);
      } else {

        content = content + curcontent;

        download('fetchedExam.html', content);

        goToFirstPageAndClear();
        
      }
      return;
    } 
    
    if(TOOLMODE == 1){
      fillFirstUrlIfEmpty(request.cururl);

      if(!request.islastpage) {
        executeAsync(injectAutoSolution);
      } else {
        goToFirstPageAndClear();

        alert("End of routine");
      }
      return;
    }

    if(request.source != null) {
      TOOLMODE = 1;
      solutionCode = request.source;
      var doc = new DOMParser().parseFromString(solutionCode, "text/html");
      var tables = doc.getElementsByTagName("table");
      for(var index = 0; index < tables.length; index++) {
        solutionCode += tables[index].outerHTML;
      }
      injectAutoSolution();
      return;
    }
});