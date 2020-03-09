// Content Script
console.log('content.js')
// Establish port
var port = chrome.runtime.connect({name: 'content'})

// Receive the message from the background script
// chrome.runtime.onMessage.addListener(gotMessage);

// function gotMessage(response, sender, sendResponse) {
//     console.log('response.txt = ' + response.txt)
//     if (response.txt == 'available?') {
//         console.log('message received from background')
//         let availableRecs = selectAvailableProducts()
//         console.log(availableRecs)
//         sendResponse({avaiableRecs: 'testing'})
//     }
// }

// Select Recommended Products
function selectRecs () {
    let testRecs = document.querySelectorAll('#leads .lead_name')
    // Loop over Recommended Products to pull Product Name strings
    let recsArray = [...testRecs].map(e => {
        return e.innerText;
    })
    console.log('recsArray')
    console.log(recsArray)
    return recsArray;
}
/* Invoke */
let Recommendations = selectRecs();

//  --------------------
// Problem: Returns nothing on load because it outpaces Admin's rendering of the available recs. 
// Solution: use SetTimeout to delay the function. 
        // Problem: Chrome API does not allow for SetTimeout use in non-persistent scripts


// Select Available Products
function selectAvailableProducts () {
    let availRecs = document.querySelectorAll('#recommended_products .product_name > a')
    // Loop over Available Products to pull Product Name strings
    let availRecsArray = [...availRecs].map(e => {
        return e.innerText;
    })
    console.log('availRecsArray')
    console.log(availRecsArray)
    return availRecsArray
}
var AvailableProducts; 
// Add delay to account for PHP delivery of available recs to DOM



// Send message to the background (Refactored below in lines 74-89)
/* 
    chrome.runtime.sendMessage({
        sender: 'content',
        txt: 'hello from the DOM',
        recs: Recommendations
    }, (response) => {
        console.log(response.message)
    }) 
*/

// Send message to background via port
port.postMessage({
    sender: 'content',
    txt: 'hello from the DOM',
    recs: Recommendations
})

// Listen for response
port.onMessage.addListener(res => {
    console.log(res.message)
    if (res.message == '200') {
        console.log('200 - request for avails')
        // Wait for DOM to receive products from Admin's PHP server
        setTimeout(function(){
            AvailableProducts = selectAvailableProducts();
            console.log("AvailableProducts")
            console.log(AvailableProducts)
            port.postMessage({
            avails: AvailableProducts
        })}, 1000);
    } else if (res.message == '201') {
        console.log('Delivered avails!')
    }
})


/* Queue-level highlight */

// Get 'lead review assignments from extension storage'
var myAdvisorsFromStorage;

function getStoredTeam () {
    chrome.storage.sync.get(['storedTeam'], async function(result) {
        myAdvisorsFromStorage = await result['storedTeam'];
        myAdvisorsFromStorage.length <= 1 ? console.assert('Error: Could not find "storedTeam" in storage.'): null;
        console.log("myAdvisorsFromStorage")
        console.log(myAdvisorsFromStorage)
        // Prepare regex 
        return myAdvisorString = myAdvisorsFromStorage.join('|')
    });
};
getStoredTeam();
   
// Container to receive 'lead review assignments from extension options'
// var myAdvisors = ['Traverso', 'Klusman', 'Wunderlick', 'Schultz', 'Andrews', 'Sone', 'Wang', 'Ziemba', 'Burlison', 'Franco', 'Butt', 'Simpson', 'Miller'];
// Convert array of advisor names to regex string
var myAdvisorString;
console.log("myAdvisorString");
console.log(myAdvisorString);

// Create containers
var matches = [];    // will hold regex matches
var nonMatches = [];    // will hold non-matches

// Query DOM for all table rows
var queueData = document.querySelectorAll("#conversions .conv_name");

// Loop over table rows after 2 seconds
setTimeout(function () {
    // Create new regex
    var regex = new RegExp(myAdvisorString, 'i');

    [...queueData].map(e => {
    e.innerText.search(regex) !== -1 ? matches.push(e) : nonMatches.push(e);
    }); 

    // Add styles to highlight each match
    matches.map(e => {
        e.setAttribute("style", "font-weight: bold; background: rgba(253, 128, 11, 0.3)")
        console.log('Match!')
    })

    // Add styles to lowlight each non-match
    nonMatches.map(e => {
        e.setAttribute("style", "opacity: .3")
    })

}, 1000);

