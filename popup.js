// Establish port
var port = chrome.runtime.connect({ name: 'popup' });

/***  DOM MANIPULATION for rendering elements ***/
let popWindow = document.getElementById('recs');

// Add [recommendations] from background to page.
// For each item in the array, create a list item element and add to the wrapper div.
function addRec(arr) {
  !arr ? (arr = ['No products found']) : null;
  arr.map(i => {
    let li = document.createElement('li');
    li.innerText = i;
    popWindow.appendChild(li);
  });
}

// Compare [recommendations] and [availables] to identify matches in the latter.
function compareRecs(arr1, arr2) {
  var matches = [];
  arr1.map(a => {
    arr2.includes(a) ? matches.push(a) : null;
  });
  return matches;
}

// Add CSS class to items in array
function addStyle(arr, property, value) {
  arr.map(a => {
    a.style[property] = value;
  });
}

/*** MESSAGING with the background.js page ***/
port.postMessage({
  sender: 'popup',
  txt: 'May I have the Recs?'
});

// Listen to respone
port.onMessage.addListener(res => {
  console.log(res);
  addRec(['-- Recs: --']);
  addRec(res.recs);
  addRec(['-- Matches: --']);
  var matches = compareRecs(res.recs, res.avails);
  addRec(matches);
});
