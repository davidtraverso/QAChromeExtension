// Get <ul> wrapper from options.html
var nameList = document.getElementById('names');

function addName(name) {
    let listItem = document.createElement('li')
    listItem.innerText = name
    nameList.appendChild(listItem)
}

// Saves options to storage and update list to reflect the new addition
function save_options() {
    var newName = document.getElementById('name').value;
    // Access the extension's storage 
    chrome.storage.sync.get(['storedTeam'], function(res) {
        if (!res['storedTeam']) {
            var myTeam = [newName];
            chrome.storage.sync.set({
                'storedTeam': myTeam,
                }, function() {
                // Update list and 'status' to let user know options were saved.
                addName(newName);
                var status = document.getElementById('status');
                status.textContent = 'Options saved.';
                setTimeout(function() {
                    status.textContent = '';
                }, 2000);
                });
        } else {
        console.log('got the stored data!')
        console.log([...res.storedTeam]);
        var myTeam = [...res.storedTeam];
        myTeam.push(newName)
        // Set storage with added name
        chrome.storage.sync.set({
            'storedTeam': myTeam,
            }, function() {
            // Update list and 'status' to let user know options were saved.
            addName(newName);
            var status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(function() {
                status.textContent = '';
            }, 2000);
            });
    }
    // Clear input
    document.getElementById('name').value = '';
});
}
  
// Query the extension's storage for an array of stored names
function render_options() {
chrome.storage.sync.get(['storedTeam'], function(result) {
    !result.storedTeam ? console.assert('Error: Could not find "storedTeam" in storage.'): null;
    console.log("result.storedTeam")
    console.log(result.storedTeam)
    result['storedTeam'].map(a => {
    addName(a);
    });
    return result.storedTeam;
});
}

function clear_storage() {
    chrome.storage.sync.set({
        'storedTeam': [],
        }, function() {
        // Update list and 'status' to let user know options were cleared.
            // ******
            removeNode('li')
            // ******
        var status = document.getElementById('status');
        setTimeout(function() {
            status.textContent = 'All names cleared';
        }, 2000);
    });
}

// Function to remove list items
function removeNode (str) {
    var listItem = [...document.getElementsByTagName(str)]
    listItem.map(e => {
        e.setAttribute("style", "display: none")
    })
}

// Listeners
document.addEventListener('DOMContentLoaded', render_options);
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('clear').addEventListener('click',
    clear_storage);