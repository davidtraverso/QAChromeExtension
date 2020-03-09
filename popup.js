// Establish port
var port = chrome.runtime.connect({name: 'popup'});

let popWindow = document.getElementById('recs');

// Create a list item element with "Hello World" and add to the wrapper div. 
function addRec (arr) {
!arr ? arr = ['No products found'] : null; 
arr.map(i => {
    let li = document.createElement('li');
    li.innerText = i
    popWindow.appendChild(li);
})
}
// Test addParagraph with initial load. 
addRec(['Recommended Products:'])

// Send message via port
port.postMessage({
    sender: 'popup',
    txt: 'May I have the Recs?'});

// Listen to respone
port.onMessage.addListener(res => {
    console.log(res)
    addRec(res.recs)
    addRec(['--------'])
    addRec(res.avails)
})

