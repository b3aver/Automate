jQuery(function(){

  AutomateModel.load().then(function(automations){
    // Convert object to a string.
    let result = JSON.stringify(automations);
    if(result == '[]'){
      result = '';
    }
    jQuery('#importTextArea').val(result);
  });

  jQuery('#export').click(function(){
    // TODO: ask if save before
    AutomateModel.load().then(function(automations){
      // Convert object to a string.
      let result = JSON.stringify(automations);

      // now
      let date = new Date();
      let dateFormatted = '' + date.getFullYear()
          + ('0' + (date.getMonth() + 1)).slice(-2)
          + ('0' + date.getDate()).slice(-2)
          + '_' + ('0' + date.getHours()).slice(-2)
          + ('0' + date.getMinutes()).slice(-2);

      // Save as file
      var blob = new Blob([result], {type: "application/json;charset=utf-8"})
      browser.downloads.download({
        url: URL.createObjectURL(blob),
        filename: 'automations_' + dateFormatted + '.json'
      }).then(function (id) {
        AutomateView.showMessage('Download started');
      }, function (error) {
        AutomateView.showError('Download failed');
      })
    });
  });

  jQuery('#import').click(function(){
    // TODO: ask confirmation because the automations will be overwritten

    let importContent = jQuery('#importTextArea').val()
    if(importContent == ''){
      importContent = '[]';
    }
    // TODO: check the parsification
    AutomateModel.setAutomations(JSON.parse(importContent));
    AutomateModel.save();

    // Reloads the extension
    browser.runtime.reload();
  });

});
