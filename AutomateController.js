AutomateController = {

  prepare: function(){

    AutomateController.refresh();

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

  save: function(){
    AutomateModel.save().then(function(){
      AutomateView.showMessageInfo('Data saved in the storage.');
    });
  },

  refresh: function(){
    AutomateModel.load().then(function(automations){
      AutomateView.refresh(automations);
      AutomateView.showMessageInfo('Data reloaded from the storage.');
    });
  },

  // TODO: to remove
  importFromFile: function(){
    // TODO: ask confirmation because the automations will be overwritten
    let filename = jQuery('#importFileInput').val().replace('C:\\fakepath\\', '');
    if (!filename) {
      AutomateView.showMessageError('Select a filename');
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
      AutomateModel.save().then(function(){
        AutomateView.deleteAutomation(guid);
        AutomateView.showMessageInfo('Automation successfully removed.');
      });
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
    AutomateModel.save().then(function(){
      AutomateView.setViewMode(guid);
      AutomateView.showMessageInfo('Automation successfully saved.');
    });
  },

  cancelEditAutomation: function(guid){
    let automation = AutomateModel.getAutomation(guid);
    if (automation == undefined) {
      AutomateView.deleteAutomation(guid);
      AutomateView.enableEdit();
    } else {
      AutomateView.addAutomation(automation);
      AutomateView.setViewMode(guid);
      AutomateView.showMessageDebug('Automation\'s edits cancelled.');
    }
  },

  runAutomation: function(guid){
    let automation = AutomateModel.getAutomation(guid);
    Automation.run(automation)
      .then(function(){
        AutomateView.notify('Automation "' + automation.name + '" ended.');
        AutomateView.showMessageDebug('Automation ended.');
      }, function(){
        AutomateView.notify('Automation "' + automation.name + '" ended with errors.');
        AutomateView.showMessageError('Automation ended with errors.');
      });
    AutomateView.showMessageDebug('Automation is running...');
  },

  runAutomationFrom: function(automationGuid, actionGuid){
    let automation = AutomateModel.getAutomation(automationGuid);
    Automation.runFrom(automation, actionGuid)
      .then(function(){
        AutomateView.notify('Automation "' + automation.name + '" ended.');
        AutomateView.showMessageDebug('Automation ended.');
      }, function(){
        AutomateView.notify('Automation "' + automation.name + '" ended with errors.');
        AutomateView.showMessageError('Automation ended with errors.');
      });
    AutomateView.showMessageDebug('Automation is running...');
  },

  runAction: function(automationGuid, actionGuid){
    let action = AutomateModel.getAction(automationGuid, actionGuid);
    Action.run(action)
      .then(function(){
        AutomateView.notify('Action "' + action.actionType + '" ended.');
        AutomateView.showMessageDebug('Action ended.');
      }, function(){
        AutomateView.notify('Action "' + action.name + '" ended with errors.');
        AutomateView.showMessageError('Action ended with errors.');
      });
    AutomateView.showMessageDebug('Action is running...');
  },

  saveAutomationsOrder: function(){
    let automationsGuid = AutomateView.getAutomationsOrder();
    AutomateModel.orderAutomations(automationsGuid);
    AutomateModel.save().then(function(){
      AutomateView.showMessageDebug('Sorting ended!!!');
    });
  },

  addAction: function(guid){
    let action = new Action();
    AutomateView.addAction(guid, action);
    AutomateView.setEditMode(guid);
  },

  deleteAction: function(automationGuid, actionGuid){
    if(confirm('Are you sure to delete this action?')){
      AutomateView.deleteAction(automationGuid, actionGuid);
      AutomateView.showMessageInfo('Action successfully removed.');
    }
  },

  pickElement: function(tags){
    let p = browser.tabs.executeScript({
      file: '/lib/css-selector-generator.min.js'
    }).then(function(){
      return browser.tabs.executeScript({
        file: '/content_scripts/pick_element.js'
      });
    }).then(function(){
      return browser.tabs.executeScript({
        code: 'admittedTags = ' + JSON.stringify(tags) + ';'
      });
    }).then(function(){
      let pp = new Promise(function(resolve, reject){
        browser.runtime.onMessage.addListener(function (message) {
          resolve(message);
        });
      });
      return pp;
    });

    return p
  },

};
