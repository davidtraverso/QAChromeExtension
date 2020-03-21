// Get <ul> wrapper from options.html
var nameList = document.getElementById('names');

// Wrapper to receive array of stored names
var nameArray;

function addName(name) {
  let listItem = document.createElement('li');
  listItem.innerHTML = `<img src="/images/remove.png" height="26px" width="26px"> <span>${name}</span>`;
  nameList.appendChild(listItem);
  addRemovalListener();
}

// Saves options to storage and update list to reflect the new addition
function save_options() {
  var newName = document.getElementById('name').value;
  // Access the extension's storage
  chrome.storage.sync.get(['storedTeam'], function(res) {
    // Edge Case: first time user won't have a 'storeTeam' key in storage
    if (!res['storedTeam']) {
      var myTeam = [newName];
      chrome.storage.sync.set(
        {
          storedTeam: myTeam
        },
        function() {
          // Update list and 'status' to let user know options were saved.
          addName(newName);
          var status = document.getElementById('status');
          status.textContent = 'Options saved.';
          setTimeout(function() {
            status.textContent = '';
          }, 2000);
        }
      );
    } else {
      console.log('got the stored data!');
      console.log([...res.storedTeam]);
      var myTeam = [...res.storedTeam];
      myTeam.push(newName);
      // Set storage with added name
      chrome.storage.sync.set(
        {
          storedTeam: myTeam
        },
        function() {
          // Update list and 'status' to let user know options were saved.
          addName(newName);
          var status = document.getElementById('status');
          status.textContent = 'Options saved.';
          setTimeout(function() {
            status.textContent = '';
          }, 2000);
        }
      );
    }
    // Clear input
    document.getElementById('name').value = '';
  });
}

// Query the extension's storage for an array of stored names
function render_options() {
  chrome.storage.sync.get(['storedTeam'], function(result) {
    !result.storedTeam ? console.assert('Error: Could not find "storedTeam" in storage.') : null;
    console.log('result.storedTeam');
    console.log(result.storedTeam);
    result['storedTeam'].map(a => {
      addName(a);
      addRemovalListener();
    });
    return (nameArray = result.storedTeam);
  });
}

// Clear name and remove list item:
// Problem: nested addEventListener in a nested function is not ideal
// Solution: (in the future) extract that logic and add to listeners at end of file
function addRemovalListener() {
  [...document.querySelectorAll('img')].map(a => {
    a.addEventListener('click', function(e) {
      // Select name via event.target
      let listItem = e.target.parentNode;
      let rmName = listItem.childNodes[2].innerText;
      console.log('rmName');
      console.log(rmName);
      console.log(typeof rmName);
      console.log('nameArray');
      console.log(nameArray);
      // New array with all non-rmName-matches
      let nameArrayNew = nameArray.filter(n => n != rmName);
      console.log('nameArrayNew');
      console.log(nameArrayNew);
      // Set storage with new array
      chrome.storage.sync.set(
        {
          storedTeam: nameArrayNew
        },
        function() {
          // Update list and 'status' to let user know options were saved.
          var status = document.getElementById('status');
          status.textContent = `Removed ${rmName} from team.`;
          setTimeout(function() {
            status.textContent = '';
          }, 2000);
        }
      );
      // Superficially remove list item
      a.parentNode.remove();
      // Update nameArray
      return (nameArray = nameArrayNew);
    });
  });
}

// Clear all names in storage
function clear_storage() {
  chrome.storage.sync.set(
    {
      storedTeam: []
    },
    function() {
      // Update list and 'status' to let user know options were cleared.
      // ******
      removeNode('li');
      // ******
      var status = document.getElementById('status');
      setTimeout(function() {
        status.textContent = 'All names cleared';
      }, 2000);
    }
  );
}

// Function to remove list items
function removeNode(str) {
  var listItem = [...document.getElementsByTagName(str)];
  listItem.map(e => {
    e.setAttribute('style', 'display: none');
  });
}

// Listeners
document.addEventListener('DOMContentLoaded', render_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('name').addEventListener('keyup', function(e) {
  e.keyCode === 13 ? save_options() : null;
});
document.getElementById('clear').addEventListener('click', clear_storage);
