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
    switch(action.actionType){
    case "gotoUrl":
      return promise.then(gotoUrl(action.params[0])).then(waitLoad());
      break;
    case "fill":
    case "fillPassword":
      return promise.then(fill(action.params[0], action.params[1]));
      break;
    case "submit":
      return promise.then(submit(action.params[0])).then(waitLoad());
      break;
    case "click":
      return promise.then(click(action.params[0])).then(waitLoad());
      break;
    case "reload":
      return promise.then(reload(action.params[0])).then(waitLoad());
    }
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
}
