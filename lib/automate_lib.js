var sidebarVersion = false;

browser.runtime.getBrowserInfo(function(info){
  var mainVersion = info.version.substr(0,info.version.indexOf('.'));
  sidebarVersion = (info.name == 'Firefox' && mainVersion >= 54);
});


function getCurrentWindow() {
  return browser.windows.getCurrent();
}

/**
 * fun: function returning a Promise
 */
function exec(fun){

}

function getCurrentTab(){
  console.log('getCurrentTab');
  var p = browser.tabs.query({
    currentWindow: sidebarVersion,
    active: true
  });
  p = p.then(function(tabs){
    return Promise.resolve({tab: tabs[0]});
  });
  return p;
}

function gotoUrl(urlRequested){
  console.log('gotoUrl');
  return function(state){
    console.log('gotoUrl');
    var p = browser.tabs.update(state.tab.id, {
      url: urlRequested
    });
    p = p.then(function(tab) {
      return Promise.resolve(state);
    });
    return p;
  };
}

function waitLoad(){
  return function(state){
    console.log('waitLoad');
    return new Promise(function(resolve){
      var wait = function(){
        console.log('wait');
        var p = browser.tabs.get(state.tab.id);
        p = p.then(function(tab){
          console.log('tab.status: ' + tab.status);
          if(tab.status != 'complete'){
            setTimeout(wait, 1000);
          } else {
            return resolve(state);
          }
        });
      };
      wait();
    });
  };
}

function fill(fieldSelector, fieldValue){
  return function(state){
    console.log('fill: ' + fieldSelector);
    var p = browser.tabs.executeScript(state.tab.id, {
      code: 'document.querySelector(\'' + fieldSelector
        + '\').value = \'' + fieldValue + '\';'
    });
    p = p.then(function(res){
      return Promise.resolve(state);
    });
    return p;
  };
}

function submit(formName){
  return function(state){
    console.log('submit: ' + formName);
    var p = browser.tabs.executeScript(state.tab.id, {
      code: 'document.querySelector(\'form[name="' + formName + '"]\').submit();'
    });
    p = p.then(function(res){
      return Promise.resolve(state);
    });
    return p;
  };
}
