function generateGUID(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class Action {
  constructor(guid = generateGUID(), actionType, params = []){
    this.guid = guid;
    this.actionType = actionType;
    this.params = params;
  }

  static run(action, promise = getCurrentTab()) {
    let manageError = function(reason){
      let errorMsg = 'Automate - stop chain';
      if (reason.message != errorMsg) {
        console.log(reason);
        AutomateView.showActionError(action.guid);
      }
      return Promise.reject(new Error(errorMsg));
    };

    // show action as started
    promise = promise.then(function(state){
      AutomateView.showActionStart(action.guid);
      return state;
    });
    // switch on actionType
    switch(action.actionType){
    case "gotoUrl":
      promise = promise
        .then(gotoUrl(action.params[0]), manageError)
        .then(waitLoad(), manageError);
      break;
    case "fill":
    case "fillPassword":
      promise = promise
        .then(fill(action.params[0], action.params[1]), manageError);
      break;
    case "submit":
      promise = promise
        .then(submit(action.params[0]), manageError)
        .then(waitLoad(), manageError);
      break;
    case "click":
      promise = promise
        .then(click(action.params[0]), manageError)
        .then(waitLoad(), manageError);
      break;
    case "reload":
      promise = promise
        .then(reload(action.params[0]), manageError)
        .then(waitLoad(), manageError);
    }
    // color action as ended or as in error
    promise = promise.then(function(state){
      AutomateView.showActionEnd(action.guid);
      return state;
    }, manageError);

    return promise;
  }

}

class Automation {
  constructor(guid = generateGUID(), name, actions = []){
    this.guid = guid;
    this.name = name;
    this.actions = actions;
  }

  static run(automation) {
    let p = getCurrentTab();
    automation.actions.forEach(function(action){
      p = Action.run(action, p);
    });
    return p;
  }

  static runFrom(automation, actionGuid) {
    let found = false;
    let p = getCurrentTab();
    automation.actions.forEach(function(action){
      if (!found && action.guid == actionGuid){
        found = true;
      }
      if (found) {
        p = Action.run(action, p);
      }
    });
    return p;
  }
}


let ActionType = {
  'gotoUrl': {
    'admittedTags': [],
    'numParams': 1,
  },

  'fill': {
    'admittedTags': ['input'],
    'numParams': 2,
  },

  'fillPassword': {
    'admittedTags': ['input'],
    'numParams': 2,
  },

  'submit': {
    'admittedTags': ['form'],
    'numParams': 1,
  },

  'click': {
    'admittedTags': ['a', 'button', 'input', 'img'],
    'numParams': 1,
  },

  'reload': {
    'admittedTags': [],
    'numParams': 1,
  },
}
