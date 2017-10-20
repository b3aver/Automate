browser.browserAction.onClicked.addListener(() => {
  browser.runtime.getBrowserInfo(function(info){
    var mainVersion = info.version.substr(0,info.version.indexOf('.'));
    if(mainVersion >= 57){
      browser.sidebarAction.open();
    } else if (mainVersion < 54) {
      var pageDate = {
        type: "detached_panel",
        url: "automate.html",
        width: 500,
        height: 600
      }
      browser.windows.create(pageDate);
    }
  });
});
