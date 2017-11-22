AutomateModel = {

  automations: [],

  prepare: function(){

  },

  save: function(){
    return browser.storage.local.set({
      automations: this.automations,
    });
  },
  load: function(){
    return browser.storage.local.get({
      automations: [], // default empty list
    }).then(function(automations){
      AutomateModel.automations = automations.automations;
      return Promise.resolve(AutomateModel.automations);
    });
  },

  getAutomations: function(){
    return this.automations;
  },

  setAutomations: function(automations){
    this.automations = automations;
  },

  orderAutomations: function(automationsGuid){
    let automationsNew = [];
    automationsGuid.forEach(function(guid){
      automationsNew.push(AutomateModel.getAutomation(guid));
    });
    AutomateModel.setAutomations(automationsNew);
  },

  getAutomation: function(guid){
    return this.automations.find(a => a.guid == guid);
  },

  saveAutomation: function(automation){
    if(this.getAutomation(automation.guid) == undefined){
      this.automations.push(automation);
    } else {
      let index = this.automations.findIndex(a => a.guid == automation.guid);
      this.automations[index] = automation;
    }
  },

  deleteAutomation: function(guid){
    let index = this.automations.findIndex(a => a.guid == guid);
    this.automations.splice(index, 1);
  },

};
