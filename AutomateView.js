AutomateView = {

  prepare: function(){
    // add sortable for Automations
    jQuery('#automations').sortable({
      handle: ".handle",
      cursor: "grabbing",
      placeholder: "automation automation-empty",
      stop: function(){
        AutomateController.saveAutomationsOrder();
      }
    });
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
    // drop up button
    jAutomation.find('.dropUpActionsButton').click(function(){
      AutomateView.dropUpActions(automation.guid);
    });
    // drop down button
    jAutomation.find('.dropDownActionsButton').click(function(){
      AutomateView.dropDownActions(automation.guid);
    });

    // iteratively add actions
    automation.actions.forEach(function(action){
      AutomateView.addAction(automation.guid, action);
    });

    // add sortable for Actions
    jAutomation.find('.actions').sortable({
      handle: ".handle",
      cursor: "grabbing",
      placeholder: "action action-empty"
    });
  },

  saveAutomation: function(guid){
    let nameNew = jQuery('#' + guid + ' input.nameAutomation').val();
    jQuery('#' + guid + ' .nameAutomation.viewMode').html(nameNew);
    // populate actions
    let actions = [];
    jQuery('#' + guid + ' .actions li.action').each(function(){
      let jAction = jQuery(this);
      let actionGuid = jAction.find('.guid').val();
      let actionType = jAction.find('select.actionType').val();
      let actionTypeLabel = jAction.find('select.actionType option:selected').text();
      // fill viewMode value
      jAction.find('.actionType.viewMode').html(actionTypeLabel);
      let params = [];
      jAction.find('.parameters .parameter').each(function(index){
        let jParameter = jQuery(this);
        let param = AutomateView.getParameterValue(jParameter, actionType);
        params.push(param);
        // fill viewMode value
        if (actionType == 'fillPassword' && index == 1){
          jParameter.find('.parameterValue.viewMode').html('***');
        } else if (actionType == 'reload') {
          if (param){
            jParameter.find('.parameterValue.viewMode').html('clear cache');
          } else {
            jParameter.find('.parameterValue.viewMode').html('');
          }
        }else {
          jParameter.find('.parameterValue.viewMode').html(param);
          jParameter.find('.parameterValue.viewMode').attr('title', param);
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

  disableEdit: function(){
    jQuery('.automation .editAutomationButton').addClass('md-inactive');
  },

  enableEdit: function(){
    jQuery('.automation .editAutomationButton').removeClass('md-inactive');
  },

  getAutomationsOrder: function(){
    let automationsGuid = [];
    jQuery('.automation[id]').each(function(){
      automationsGuid.push(jQuery(this).attr('id'));
    });
    return automationsGuid;
  },

  setEditMode: function(guid){
    AutomateView.disableEdit();
    AutomateView.dropDownActions(guid);
    jQuery('#' + guid + ' .viewMode').hide();
    jQuery('#' + guid + ' .editMode').show();
  },

  setViewMode: function(guid){
    jQuery('#' + guid + ' .viewMode').show();
    jQuery('#' + guid + ' .editMode').hide();
    AutomateView.dropDownActions(guid);
    AutomateView.enableEdit();
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
      AutomateView.prepareParameter(jParameter, action.actionType, param, index + 1);
    });
  },

  prepareParameter: function(jParameter, actionType, param, nth){
    jParameter.find('.parameterValue.editMode').val(param);
    jParameter.find('.parameterValueLabel.editMode').html('');
    if (actionType == 'fillPassword' && nth == 2){
      jParameter.find('.parameterValue.editMode').attr('type', 'password');
      jParameter.find('.parameterValue.viewMode').html('***');
    } else if (actionType == 'reload'){
      let checked = param;
      jParameter.find('.parameterValue.editMode').attr('type', 'checkbox');
      jParameter.find('.parameterValue.editMode').prop('checked', checked);
      jParameter.find('.parameterValueLabel.editMode').html('clear cache');
      if (checked){
        jParameter.find('.parameterValue.viewMode').html('clear cache');
      }
    } else {
      jParameter.find('.parameterValue.editMode').attr('type', 'text');
      jParameter.find('.parameterValue.viewMode').html(param);
      jParameter.find('.parameterValue.viewMode').attr('title', param);
    }
  },

  getParameterValue: function(jParameter, actionType){
    let param = jParameter.find('.parameterValue.editMode').val();
    if (actionType == 'reload'){
      param = jParameter.find('.parameterValue.editMode').is(':checked');
    }
    return param;
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
      numParams = 1;
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

    jAction.find('.parameters .parameter').each(function(index){
      let jParameter = jQuery(this);
      let param = AutomateView.getParameterValue(jParameter, actionType);
      AutomateView.prepareParameter(jParameter, actionType, param, index + 1);
      jParameter.find('.viewMode').hide();
      jParameter.find('.editMode').show();
    });
  },

  /* drop up/down actions */
  dropUpActions: function(automationGuid) {
    let jAutomation = jQuery('.automation#' + automationGuid);
    jAutomation.find('.actions, .dropUpActionsButton').hide();
    jAutomation.find('.dropDownActionsButton').show();
  },
  dropDownActions: function(automationGuid) {
    let jAutomation = jQuery('.automation#' + automationGuid);
    jAutomation.find('.actions, .dropUpActionsButton').show();
    jAutomation.find('.dropDownActionsButton').hide();
  },

};
