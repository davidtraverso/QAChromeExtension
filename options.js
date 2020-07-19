// Get <ul> wrapper from options.html
var nameList = document.getElementById('names');

// Wrapper to mirror stored names
var nameArray;

const getInitialValues = (storageKey) => {
  chrome.storage.sync.get([storageKey], (result) => {
    if (!result.storedTeam) {
      console.assert(`Error: Could not find ${storageKey} in storage.`);
    }
    result[storageKey].forEach((a) => {
      appendNameToList(a, nameList);
      addRemovalListener();
    });
    return (nameArray = result.storedTeam);
  });
};

const appendNameToList = (name, list) => {
  let listItem = document.createElement('li');
  listItem.innerHTML = `<img src="/images/remove.png" height="26px" width="26px"> <span>${name}</span>`;
  list.appendChild(listItem);
  addRemovalListener();
};

const addRemovalListener = () => {
  [...document.querySelectorAll('img')].forEach((a) => {
    a.addEventListener('click', removalHandler);
  });
};

const removalHandler = (event) => {
  // Select name via event.target
  let parentElement = event.target.parentNode;
  let removedName = parentElement.childNodes[2].innerText;
  let persistingNameArray = nameArray.filter((n) => n != removedName);
  setStorage(storedTeam, persistingNameArray, `Removed ${removedName} from team.`);
  // Superficially remove list item
  a.parentNode.remove();
  // Update global nameArray variable
  return (nameArray = persistingNameArray);
};

const updateStoredValues = (inputName) => {
  var newName = getInputValue(inputName);
  chrome.storage.sync.get(['storedTeam'], (res) => {
    // Edge Case: first time user won't have a 'storeTeam' key in storage`
    if (!res['storedTeam']) {
      setStorage(storedTeam, newName, 'Options saved.');
    }
    setStorage(storedTeam, [...res.storedTeam, newName], 'Options saved.');
    clearInputValue(inputName);
  });
};

const getInputValue = (elementId) => {
  return document.getElementById(elementId).value;
};

const clearInputValue = (elementId) => {
  document.getElementById(elementId).value = '';
};

const setStorage = (storageKey, value, messageToUser) => {
  chrome.storage.sync.set({ [storageKey]: value }, () => {
    // Update list and 'status' to let user know options were saved.
    // TODO: Refactor this function so the following are outside of the scope
    appendNameToList(newName, nameList);
    sendClientStatus(messageToUser);
  });
};

const sendClientStatus = (message) => {
  var status = document.getElementById('status');
  status.textContent = message;
  setTimeout(() => {
    status.textContent = '';
  }, 2000);
};

// Clear all names in storage
const deleteStoredValues = (storageKey) => {
  // * setStorage(storedTeam, [], 'All names cleared'); * //
  chrome.storage.sync.set(
    {
      [storageKey]: [],
    },
    // TODO: need to refactor setStorage to include callback functions:
    () => {
      // Update list and 'status' to let user know options were cleared.
      removeAllNodes('li');
      sendClientStatus('All names cleared');
    }
  );
};

// Function to remove list items
const removeAllNodes = (nodeTagName) => {
  var listItem = [...document.getElementsByTagName(nodeTagName)];
  listItem.forEach((e) => {
    e.setAttribute('style', 'display: none');
  });
};

// Listeners
document.addEventListener('DOMContentLoaded', getInitialValues('storedTeam'));
document.getElementById('save').addEventListener('click', updateStoredValues('name'));
document.getElementById('name').addEventListener('keyup', (e) => {
  e.keyCode === 13 ? updateStoredValues('name') : null;
});
document.getElementById('clear').addEventListener('click', deleteStoredValues('storedTeam'));
