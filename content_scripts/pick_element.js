
var admittedTags;
var previousTag;


/*
 * Event functions
 */

function pickElement(e){
  e.preventDefault();
  if (isAdmittedTag(e.target.tagName)){
    removeHighlight();
    let selectorGenerator = new CssSelectorGenerator;
    let selector = selectorGenerator.getSelector(e.target);
    browser.runtime.sendMessage({'tagName': e.target.tagName,
                                 'url': e.target.href,
                                 'selector': selector});
    window.removeEventListener('click', pickElement, true);
    document.body.removeEventListener('mouseover', highlight, false);
  }
}

function highlight(e){
  if (e.target === document.body
      || (previousTag && previousTag === e.target)
      || !isAdmittedTag(e.target.tagName)) {
    return;
  }
  removeHighlight();
  if (e.target) {
    previousTag = e.target;
    previousTag.className += " automate-highlight";
  }
}
function removeHighlight(){
  if (previousTag) {
    previousTag.className = previousTag.className.replace(/\bautomate-highlight\b/, '');
    previousTag = undefined;
  }
}

function isAdmittedTag(tag){
  if (admittedTags.length == 0 || (admittedTags.length == 1 && admittedTags[0] == '*')){
    return true;
  } else {
    let found = false;
    admittedTags.forEach(function(elem){
      if (elem.toUpperCase() === tag){
        found = true;
      }
    });
    return found;
  }
}

/*
 * Add styles
 */
if (!document.getElementById('injectedStyle')){
  var css = document.createElement('style');
  css.id = 'injectedStyle';
  css.type = 'text/css';
  css.innerHTML = '.automate-highlight {border: 1px solid red}';
  document.body.appendChild(css);
}

/*
 * Add event listeners
 */
window.removeEventListener('click', pickElement, true);
window.addEventListener('click', pickElement, true);

document.body.removeEventListener('mouseover', highlight, false);
document.body.addEventListener('mouseover', highlight, false);
