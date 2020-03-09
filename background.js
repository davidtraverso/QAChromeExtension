// Background Script
console.log('Background script is running');
// Establish port
// var port = chrome.runtime.connect({name: "background"})



// Listen for the Extension icon click
chrome.browserAction.onClicked.addListener(buttonClicked);


// Function to send message to popup scripts on click
function buttonClicked (tab) {
  let message = {
    txt: "hello from background.js"
  }
  // SendMessage Method for one-time messaging
  chrome.runtime.sendMessage(tab.id, message)

  // RunTime Connection for long-lived connections
  port.postMessage(message)
}

/* ---------------------------------- */

chrome.runtime.onConnect.addListener(function(port){
  if(port.name == 'content'){
    // Content Script Messaging
    port.onMessage.addListener(req => {
      console.log(req)
      if(req.recs) {
        recsFromContent = req.recs
        console.log("recsFromContent")
        console.log(recsFromContent)
        port.postMessage({message: '200', recs: recsFromContent})
      } else if (req.avails) {
        availableProducts = req.avails
        console.log("availableProducts")
        console.log(availableProducts)
        port.postMessage({message: '201'})
      }
    })
  } else if (port.name == 'popup') {
    // Popup Messaging
    port.onMessage.addListener(req => {
      console.log(req)
        console.log("recsFromContent")
        console.log(recsFromContent)
        port.postMessage({
          message: '"Here you go!" - background.js',
          recs: recsFromContent,
          avails: availableProducts
        })
    })

  }
});


// Define containers
var recsFromContent;
var availableProducts;
