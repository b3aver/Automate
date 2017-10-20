AutomateView = {

  prepare: function(){

  },

  showMessage: function(message){
    // TODO: implement
    console.log('Message: ' + message);
  },

  showError: function(message){
    // TODO: implement
    console.log('Error: ' + message);
  },

  refresh: function(automations){
    jQuery('#automations .automation').remove();
    automations.forEach(function(automation){
      AutomateView.addAutomation(automation);
      AutomateView.setViewMode(automation.guid);
    });
  },

  addAutomation: function(automation){
    // add the automation
    jQuery('#templates .automation').clone().appendTo('#automations');
    let jAutomation = jQuery('#automations .automation:last-child');
    jAutomation.attr('id', automation.guid);
    // name
    jAutomation.find('.nameAutomation.viewMode').html(automation.name);
    jAutomation.find('input.nameAutomation').val(automation.name);
    // guid
    jAutomation.find('> input.guid').val(automation.guid);

    // play automation button
    jAutomation.find('.runAutomationButton').click(function(){
      AutomateController.runAutomation(automation.guid);
    });
    // edit automation button
    jAutomation.find('.editAutomationButton').click(function(){
      AutomateController.editAutomation(automation.guid);
    });
    // save automation button
    jAutomation.find('.saveAutomationButton').click(function(){
      AutomateController.saveAutomation(automation.guid);
    });
    // delete automation button
    jAutomation.find('.deleteAutomationButton').click(function(){
      AutomateController.deleteAutomation(automation.guid);
    });
    // add action button
    jAutomation.find('.addActionButton').click(function(){
      AutomateController.addAction(automation.guid);
    });

    // iteratively add actions
    automation.actions.forEach(function(action){
      AutomateView.addAction(automation.guid, action);
    });
  },

  saveAutomation: function(guid){
    let nameNew = jQuery('#' + guid + ' input.nameAutomation').val();
    jQuery('#' + guid + ' .nameAutomation.viewMode').html(nameNew);
    // populate actions
    let actions = [];
    jQuery('#' + guid + ' .actions li.action').each(function(){
      let actionGuid = jQuery(this).find('.guid').val();
      let actionType = jQuery(this).find('.actionType').val();
      let params = [];
      jQuery(this).find('.parameters input').each(function(){
        let param = jQuery(this).val();
        params.push(param);
      });
      let action = new Action(actionGuid, actionType, params);
      actions.push(action);
    });

    return new Automation(guid, nameNew, actions);
  },

  deleteAutomation: function(guid){
    jQuery('#' + guid).remove();
  },

  setEditMode: function(guid){
    jQuery('#' + guid + ' .viewMode').hide();
    jQuery('#' + guid + ' .editMode').show();
    jQuery('#' + guid + ' .actionType').prop('disabled', false);
    jQuery('#' + guid + ' .parameters input').prop('disabled', false);
  },

  setViewMode: function(guid){
    jQuery('#' + guid + ' .viewMode').show();
    jQuery('#' + guid + ' .editMode').hide();
    jQuery('#' + guid + ' .actionType').prop('disabled', true);
    jQuery('#' + guid + ' .parameters input').prop('disabled', true);
  },

  addAction: function(automationGuid, action){
    // add the action
    jQuery('#templates .action').clone()
      .appendTo(jQuery('#' + automationGuid + ' .actions'));
    let jAction = jQuery('#automations .automation:last-child'
                         + ' .action:last-child');
    jAction.attr('id', action.guid);

    // action type
    jAction.find('.actionType').val(action.actionType);
    // guid
    jAction.find('> input.guid').val(action.guid);

    // action type event
    jAction.find('.actionType').change(function(){
      AutomateView.onChangeActionType(automationGuid, action.guid);
    });
    // delete action button
    jAction.find('.deleteActionButton').click(function(){
      AutomateController.deleteAction(automationGuid, action.guid);
    });

    // iteratively add parameters
    action.params.forEach(function(param){
      jQuery('#templates .parameter').clone()
        .appendTo(jAction.find('.parameters'));
      jAction.find('.parameters .parameter:last-child').val(param);
    });
  },

  deleteAction: function(automationGuid, actionGuid){
    jQuery('#' + automationGuid + ' #' + actionGuid).remove();
  },

  onChangeActionType: function(automationGuid, actionGuid){
    let jAction = jQuery('#' + automationGuid + ' #' + actionGuid);
    let actionType = jAction.find('.actionType').val();
    let numParams = 1;
    switch(actionType){
    case "gotoUrl":
    case "submit":
      numParams = 1;
      break;
    case "fill":
      numParams = 2;
    }
    let numParamsActual = jAction.find('.parameters .parameter').length;
    if(numParamsActual > numParams){
      jAction.find('> .parameters .parameter:nth-last-child(-n+'
                   + (numParamsActual - numParams) + ')').remove();
    } else if(numParamsActual < numParams) {
      jQuery('#templates .parameter').clone()
        .appendTo(jAction.find('.parameters'));
    }
  },
};
