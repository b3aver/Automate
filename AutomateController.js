AutomateController = {

  prepare: function(){

    AutomateController.refresh();

    jQuery('#save').click(function(){
      AutomateModel.save();
    });

    jQuery('#refresh').click(function(){
      AutomateController.refresh();
    });

    jQuery('#options').click(function(){
      browser.runtime.openOptionsPage();
    });

    jQuery('#addAutomationButton').click(function(){
      AutomateController.addAutomation();
    });

  },

  refresh: function(){
    AutomateModel.load().then(function(automations){
      AutomateView.refresh(automations);
    });
  },

  // TODO: to remove
  importFromFile: function(){
    // TODO: ask confirmation because the automations will be overwritten
    let filename = jQuery('#importFileInput').val().replace('C:\\fakepath\\', '');
    if (!filename) {
      AutomateView.showError('Select a filename');
    } else {
      let path = jQuery('#importFilePathInput').val() + '/' + filename;
      if (!path.startsWith('file://')) {
        path = 'file://' + path;
      }
      fetch(path, {mode:'same-origin'})   // <-- important
        .then(function(result){
          return result.blob();
        })
        .then(function(blob){
          let reader = new FileReader();
          reader.addEventListener('loadend', function(){
            AutomateModel.setAutomations(JSON.parse(this.result));
            AutomateModel.save();
            AutomateView.refresh(AutomateModel.getAutomations());
          });
          reader.readAsText(blob);
        });
    }
  },

  addAutomation: function(){
    let automation = new Automation();
    AutomateView.addAutomation(automation);
    AutomateView.setEditMode(automation.guid);
  },

  deleteAutomation: function(guid){
    if(confirm('Are you sure to delete this automation?')){
      AutomateModel.deleteAutomation(guid);
      AutomateView.deleteAutomation(guid);
      AutomateView.showMessage('Automation successfully removed.');
    }
  },

  editAutomation: function(guid){
    if (!jQuery('#' + guid + ' .editAutomationButton').hasClass('md-inactive')) {
      AutomateView.setEditMode(guid);
    }
  },

  saveAutomation: function(guid){
    let automationNew = AutomateView.saveAutomation(guid);
    AutomateModel.saveAutomation(automationNew);
    AutomateView.setViewMode(guid);
    AutomateView.showMessage('Automation successfully saved.');
  },

  cancelEditAutomation: function(guid){
    let automation = AutomateModel.getAutomation(guid);
    if (automation == undefined) {
      AutomateView.deleteAutomation(guid);
      AutomateView.enableEdit();
    } else {
      AutomateView.addAutomation(automation);
      AutomateView.setViewMode(guid);
      AutomateView.showMessage('Automation\'s edits cancelled.');
    }
  },

  runAutomation: function(guid){
    let automation = AutomateModel.getAutomation(guid);
    Automation.run(automation);
    AutomateView.showMessage('Automation is running...');
  },

  addAction: function(guid){
    let action = new Action();
    AutomateView.addAction(guid, action);
    AutomateView.setEditMode(guid);
  },

  deleteAction: function(automationGuid, actionGuid){
    if(confirm('Are you sure to delete this action?')){
      AutomateView.deleteAction(automationGuid, actionGuid);
      AutomateView.showMessage('Action successfully removed.');
    }
  },

};
