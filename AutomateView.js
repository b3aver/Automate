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
    // find the automation
    let jAutomation = jQuery('li.automation#' + automation.guid);
    // check if it exists
    if (jAutomation.length > 0){
      // destroy and rebuild the fields of the automation
      let jAutomationNew = jQuery('#templates .automation').clone();
      jAutomation.replaceWith(jAutomationNew);
      jAutomation = jAutomationNew;
    } else {
      // create the fields for a new automation
      jQuery('#templates .automation').clone().appendTo('#automations');
      jAutomation = jQuery('#automations .automation:last-child');
    }
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
    // cancel edit automation button
    jAutomation.find('.cancelEditAutomationButton').click(function(){
      AutomateController.cancelEditAutomation(automation.guid);
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
      let actionType = jQuery(this).find('select.actionType').val();
      let actionTypeLabel = jQuery(this).find('select.actionType option:selected').text();
      // fill viewMode value
      jQuery(this).find('.actionType.viewMode').html(actionTypeLabel);
      let params = [];
      jQuery(this).find('.parameters .parameter').each(function(index){
        let param = jQuery(this).find('input.parameterValue').val();
        params.push(param);
        // fill viewMode value
        if (actionType == 'fillPassword' && index == 1){
          jQuery(this).find('.parameterValue.viewMode').html('***');
        } else {
          jQuery(this).find('.parameterValue.viewMode').html(param);
          jQuery(this).find('.parameterValue.viewMode').attr('title', param);
        }
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
  },

  setViewMode: function(guid){
    jQuery('#' + guid + ' .viewMode').show();
    jQuery('#' + guid + ' .editMode').hide();
  },

  addAction: function(automationGuid, action){
    // add the action
    jQuery('#templates .action').clone()
      .appendTo(jQuery('.automation#' + automationGuid + ' .actions'));
    let jAction = jQuery('.automation#' + automationGuid
                         + ' .action:last-child');
    jAction.attr('id', action.guid);

    // action type
    jAction.find('select.actionType').val(action.actionType);
    let actionTypeLabel = jAction.find('select.actionType option:selected').text();
    jAction.find('.actionType.viewMode').html(actionTypeLabel);
    // guid
    jAction.find('> input.guid').val(action.guid);

    // action type event
    jAction.find('select.actionType').change(function(){
      AutomateView.onChangeActionType(automationGuid, action.guid);
    });
    // delete action button
    jAction.find('.deleteActionButton').click(function(){
      AutomateController.deleteAction(automationGuid, action.guid);
    });

    // iteratively add parameters
    action.params.forEach(function(param, index){
      jQuery('#templates .parameter').clone()
        .appendTo(jAction.find('.parameters'));
      let jParameter = jAction.find('.parameters .parameter:last-child');
      jParameter.find('input.parameterValue').val(param);
      if (action.actionType == 'fillPassword' && index == 1){
        jParameter.find('.parameterValue.viewMode').html('***');
      } else {
        jParameter.find('.parameterValue.viewMode').html(param);
        jParameter.find('.parameterValue.viewMode').attr('title', param);
      }
    });
  },

  deleteAction: function(automationGuid, actionGuid){
    jQuery('#' + automationGuid + ' #' + actionGuid).remove();
  },

  onChangeActionType: function(automationGuid, actionGuid){
    let jAction = jQuery('#' + automationGuid + ' #' + actionGuid);
    let actionType = jAction.find('select.actionType').val();
    let numParams = 1;
    switch(actionType){
    case 'reload':
      numParams = 0;
      break;
    case 'gotoUrl':
    case 'submit':
    case 'click':
      numParams = 1;
      break;
    case 'fill':
    case 'fillPassword':
      numParams = 2;
    }
    let numParamsActual = jAction.find('.parameters .parameter').length;
    if(numParamsActual > numParams){
      jAction.find('> .parameters .parameter:nth-last-child(-n+'
                   + (numParamsActual - numParams) + ')').remove();
    } else {
      while(numParamsActual < numParams) {
        jQuery('#templates .parameter').clone()
          .appendTo(jAction.find('.parameters'));
        numParamsActual++;
      }
    }
    let jParameterValue = jAction.find('.parameters .parameter:nth-child(2)'
                                       + ' input.parameterValue');
    if(actionType == 'fillPassword'){
      jParameterValue.attr('type', 'password');
    } else {
      jParameterValue.attr('type', 'text');
    }
  },
};
