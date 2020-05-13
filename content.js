// Content Script

// Establish port
var port = chrome.runtime.connect({ name: 'content' });

/*** Qualification Level Scripts ***/
var qualPage = '/admin/qualification.php';
if (window.location.href.includes(qualPage)) {
  /* Add observer that makes prices bold when scrolled down to recs */
  var recsDiv = document.getElementById('recommended_products');
  
  window.addEventListener('load', (e) => {
    createObserver();
    listenForNoteHover()
  });
  
  function createObserver() {
    let observer;
    let options = {
      root: null,
      rootMargin: '0px',
      threshold: [0.01],
    };
    observer = new IntersectionObserver(boldPrices, options);
    observer.observe(recsDiv);
  }

  // Run regex to add a span around price text
  function boldPrices() {
    var recs = document.querySelectorAll('#recommended_products .product_price');
    var regex = /[$](\d)+[k|\.|,]?(\d)*/gi;
    var newHTML = [...recs].map((e) => {
      return e.innerHTML.replace(regex, addSpan);
    });
    function addSpan(match) {
      return `<span class="match" style="font-weight:bold;color:#000000;text-shadow:2px 2px 7px rgba(253, 128, 11, 0.8)">${match}</span>`;
    }
    for (var i = 0; i < recs.length; i++) {
      recs[i].innerHTML = newHTML[i];
    }
  }

  // Render budget note as a sticky element above product pricing notes
  // Problem: sticky positioning won't work inside wrapper div (#main_content) since 'overflow:hidden'
  // Solution: add element outside of this wrapper
  // Solution: utilize the currently working 'sticky' navbar to add a new icon (utilize the environment and don't reinvent the wheel)
  /* Add icon to navbar */
  var navList = document.querySelector('#icons_top ul');
  // Fix width of parent <div> to prevent side effects
  navList.parentNode.setAttribute('style', 'width:78%');
  var budgetItem = document.createElement('li');
  var iconSRC = 'https://software-advice.imgix.net/homepage/icon-brand_accounting.png';
  var budgetIcon = `<img id="quabity" src="${iconSRC}" alt="Show Budget" title="Show Budget" height="16" width="16">`;
  budgetItem.innerHTML = budgetIcon;
  // Add icon to navbar
  navList ? navList.appendChild(budgetItem) : null;

  // Create div node for budget note
  // Extract notes from field
  function extractNotes(str) {
    var budgetField = document.getElementsByName(str);
    var note = '';
    budgetField[0].value ? (note = budgetField[0].value) : (note = '---');
    return note;
  }

  var userNote = extractNotes('cn_subsize2');
  var budgetNote = extractNotes('cn_budget');
  var budgetDiv = document.createElement('div');
  budgetDiv.id = 'quabity_note';
  var budgetDivStyles =
    'margin:30px 0 0 330px; padding:0 8px 0 8px; background:rgba(253, 128, 11); text-align:left; visibility:hidden;';
  budgetDiv.setAttribute('style', budgetDivStyles);
  budgetDiv.innerHTML = `
    <p style="display:inline-block; margin:4px 0 0 0;">Users: ${userNote}</p><br/>
    <p style="display:inline-block; margin:4px 0 0 0;">Budget: ${budgetNote}</p>
    `;

  /*  Available other rendering in div:
    var sizeNote = extractNotes('cn_size')
    var userNote = extractNotes('cn_subsize2')
    <p style="display:inline-block; margin:4px 0 0 0;">Size: ${sizeNote}</p><br/>
    <p style="display:inline-block; margin:4px 0 0 0;">Users: ${userNote}</p><br/>
    */

  // Append budgetDiv to DOM
  document.getElementById('icons_top').appendChild(budgetDiv);

  // Add listener icon that toggles budget note visibility on click
  document.getElementById('quabity').addEventListener('click', function () {
    let budgetDiv = document.getElementById('quabity_note');
    if (budgetDiv.style.visibility == 'hidden') {
      budgetDiv.style.visibility = 'visible';
      highlightRecs(0.3);
    } else {
      budgetDiv.style.visibility = 'hidden';
      highlightRecs(0);
    }
  });


  /* Notes Scoring Feature */
  function listenForNoteHover() {
    // Remove ID from Reports tab to kill Admin's jQuery listener that interferes with the mouseenter event below
    let reportsTab = document.getElementById('menu_reports')
    reportsTab.id = '';
    
    let notesIcon = document.getElementsByClassName('contains-lead-score-form');
    [...notesIcon][0].addEventListener('mouseenter', (e) => {
      scoreNotes();
    });
  };

  function scoreNotes() {
      document.getElementById('lead_score').click()
      let list = document.getElementById('lead_score_form').firstElementChild;
      [...list.children].map(listItem => {
        listItem.addEventListener('click', (e) => {
          e.target.dataset.score ? addScoreText(e.target.dataset.score) : addScoreText(e.target.firstElementChild.dataset.score);
          // document.getElementById('save_score').click(); <-- BUG: Excessive window.alert()s with this added
        })
        // listItem.addEventListener('dblclick', (e) => {
        //   document.getElementById('save_score').click();
        //   e.stopPropagation();
        // })
      })
  }

  function addScoreText(rating) {
    let ratingTextOptions = {
      1: `Multiple mistakes to be corrected or edits to be made by QA \nQA or advisor-required changes that affect recommendations or revenue`,
      2: `Multiple mistakes to be corrected or edits to be made by QA \nQA or advisor-required changes that do not affect recommendations or revenue \nCanned, redundant, or surface-level notes \nChats back to the advisor to clarify unclear notes or to “beef up” extremely thin notes`,
      3:  `Minimal mistakes to be corrected or edits to be made by QA \nFree of issues that would require a chat back to the advisor \nAppropriate filters and recommendations selected \nAdequate information for recommended vendor(s) to begin the sales process`, 
      4: `Few to no mistakes to be corrected or edits to be made by QA \n1-2 areas with unique, insightful, and thorough notes that will assist vendors in the sales process`,
      5: `Few to no mistakes to be corrected or edits to be made by QA including but not limited to grammar, spelling (especially of product or vendor names), and contact information (including website where applicable) \nAn expanded company description including what the business does, the makeup of the company, and any other facts you have surfaced on the call. \nSize/user/employee classification with any details surfaced, no blank fields \nTimeline details \nExpanded, unique, insightful notes from second or third-level questions in at least the Shopping Around, Key Features, and Contact/Authority or Follow-up fields that will assist vendors in the sales process. Includes notes that speak to the specific impact on the business or processes and any unique tips or techniques you used successfully on the call. \nAll notes are substantive and purposeful with no filler.`
    }
    let textField = document.getElementsByName('score_comment')
    textField[0].value = ratingTextOptions[rating]
  }


  // Select Recommended Products
  function selectRecs() {
    let testRecs = document.querySelectorAll('#leads .lead_name');
    // Loop over Recommended Products to pull Product Name strings
    let recsArray = [...testRecs].map((e) => {
      return e.innerText;
    });
    return recsArray;
  }
  /* Invoke */
  let Recommendations = selectRecs();

  //  --------------------
  // Problem: Returns nothing on load because it outpaces Admin's rendering of the available recs.
  // Solution: use SetTimeout to delay the function.
  // Problem: Chrome API does not allow for SetTimeout use in non-persistent scripts
  // Solution: make the script persistent ;)

  // Highlights recs in available list
  function highlightRecs(num) {
    let availRecs = document.querySelectorAll('#recommended_products .product_name > a');
    // Loop over Available Products to pull Product Name strings
    let availRecsArray = [...availRecs].map((e) => {
      Recommendations.includes(e.innerText)
        ? e.parentNode.parentNode.setAttribute('style', `background:rgba(253, 128, 11, ${num})`)
        : null;
    });
    return availRecsArray;
  }

  // Select Available Products
  function selectAvailableProducts() {
    let availRecs = document.querySelectorAll('#recommended_products .product_name > a');
    // Loop over Available Products to pull Product Name strings
    let availRecsArray = [...availRecs].map((e) => {
      return e.innerText;
    });
    return availRecsArray;
  }
  var AvailableProducts;
  // Add delay to account for PHP delivery of available recs to DOM
  

  // Tech Debt: Send message to background via port
  port.postMessage({
    sender: 'content',
    txt: 'hello from the DOM',
    recs: Recommendations,
  });
  // Listen for response
  port.onMessage.addListener((res) => {
    if (res.message == '200') {
      // Wait for DOM to receive products from Admin's PHP server
      setTimeout(function () {
        AvailableProducts = selectAvailableProducts();
        port.postMessage({
          avails: AvailableProducts,
        });
      }, 1000);
    } else if (res.message == '201') {
      console.log('Delivered avails!');
    }
  });
}

/*** Queue-level highlight ***/
var queuePage = '/admin/conversions.php';
if (window.location.href.includes(queuePage)) {
  // Get 'lead review assignments from extension storage'
  var myAdvisorsFromStorage;
  function getStoredTeam() {
    chrome.storage.sync.get(['storedTeam'], async function (result) {
      myAdvisorsFromStorage = await result['storedTeam'];
      myAdvisorsFromStorage.length <= 1 ? console.assert('Error: Could not find "storedTeam" in storage.') : null;
      // Prepare regex
      return (myAdvisorString = myAdvisorsFromStorage.join('|'));
    });
  }
  getStoredTeam();

  // Container to receive 'lead review assignments from extension options'
  var myAdvisorString;

  // Create containers
  var matches = []; // will hold regex matches
  var nonMatches = []; // will hold non-matches
  var deletedReviewed = [];

  // Query DOM for all table rows
  var queueData = document.querySelectorAll('#conversions .conv_name');
  var deletedQueueData = document.querySelectorAll('#conversions .conv_name_grey');

  // Function to render container counts on page
  function renderCount(arr, str, style) {
    let wrapper = document.getElementById('conversion_filters');
    let firstChild = wrapper.firstChild;
    arr.length ? null : (arr = []);
    let injHTML = `${str}: ${arr.length}`;
    let inj = document.createElement('span');
    inj.innerHTML = injHTML;
    inj.setAttribute('style', `float:left; ${style}`);
    return wrapper.insertBefore(inj, firstChild);
  }

  // Loop over table rows after 2 seconds
  setTimeout(function () {
    // Create new regex
    var regex = new RegExp(myAdvisorString, 'i');
    var deletedDead = /####/g;

    // Loop over 'Pending Queue'
    [...queueData].map((e) => {
      e.innerText.search(regex) !== -1 ? matches.push(e) : nonMatches.push(e);
    });

    // Loop over 'Deleted Queue'
    [...deletedQueueData].map((e) => {
      if (e.innerText.search(regex) !== -1) {
        e.innerText.search(deletedDead) !== -1 ? deletedReviewed.push(e) : matches.push(e);
      } else {
        nonMatches.push(e);
      }
    });

    // Add styles to highlight each match
    matches.map((e) => {
      e.setAttribute('style', 'font-weight:bold; background:rgba(253, 128, 11, 0.3)');
    });
    // Add styles to lowlight each non-match
    nonMatches.map((e) => {
      e.setAttribute('style', 'opacity: .3');
    });
    // Add styles to lowlight each deleted completed
    deletedReviewed.map((e) => {
      e.setAttribute('style', 'opacity: .5; color:rgba(253, 128, 11) !important');
    });

    // Add <span> Totals </span> to top of deleted queue
    if (deletedQueueData.length > 0) {
      renderCount(deletedReviewed, 'Reviewed', 'margin-left:5%');
      renderCount(matches, 'To Review');
    }
  }, 1000);
}
