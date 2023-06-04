let elButtonStartFetch = document.getElementById('idStartFetch');
let elButtonPush = document.getElementById('idSourceButton');
let elButtonFetchSingle = document.getElementById('idFetchSingle');
let elButtonOpenShared = document.getElementById('idOpenShared');

chrome.storage.sync.get('color', function(data) {
  elButtonStartFetch.style.backgroundColor = data.color;
  elButtonStartFetch.setAttribute('value', data.color);

  elButtonPush.style.backgroundColor = data.color;
  elButtonPush.setAttribute('value', data.color);

  elButtonFetchSingle.style.backgroundColor = data.color;
  elButtonFetchSingle.setAttribute('value', data.color);

  elButtonOpenShared.style.backgroundColor = data.color;
  elButtonOpenShared.setAttribute('value', data.color);
});

elButtonStartFetch.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
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
  });
};

elButtonPush.onclick = function(element) {
  var textareaElement = document.getElementById('idSourceInput');
  var code = textareaElement.value;
  if(code != '') {
    chrome.runtime.sendMessage({source: code}, function (response) {});
  } else {
    
  }
}

elButtonFetchSingle.onclick = function(element) {
  chrome.runtime.sendMessage({singlefetcher: "fetchsingle"}, function (response) {});
}

elButtonOpenShared.onclick = function(element) {
  chrome.runtime.sendMessage({singlefetcher: "openshared"}, function (response) {});
}