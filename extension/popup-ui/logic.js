// this file runs on the popup-ui
// it sends messages to background.js or the dom-filter.js
const filterInput = document.querySelector('.container__footer input');
const filterDisplay = document.querySelector('.container__body');

const createFilterItem = (name) => (
  `<div class="container__body-row-item">
    <h3>${name}</h3>
    <button type="button" title="remove filter" class="container__body-row-item-remove-btn">
      <img src="./icons/red-x-icon.svg"/>
    </button>
  </div>`
);

const sendMessageToDomFilter = (msg) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
      // not doing anything with response yet
      console.log(response);
    });  
  });
}

const sendMessageToBg = (msg) => {
  chrome.runtime.sendMessage({
    message: msg
  });
}

const removeFilter = (filter) => {
  sendMessageToBg({
    type: 'update-filter',
    action: 'remove',
    filter
  });
}

const addNewFilter = (filter) => {
  sendMessageToBg({
    type: 'update-filter',
    action: 'add',
    filter
  });
}

const getFilters = () => {
  sendMessageToBg({
    getFilters: true,
  });
}

const renderFilters = (filters) => {
  filters.forEach(filter => filterDisplay.innerHTML += createFilterItem(filter));
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  console.log('logic', request);
  const msg = request;

  if (msg?.filters) {
    renderFilters(msg.filters);
  }
});

document.addEventListener('click', (e) => {
  if (e.target.getAttribute('id') === 'add-filter-btn') {
    const filter = filterInput.value;
    // sendMessageToBg('yo');
  }

  if (Array.from(e.target.classList).includes('container__body-row-item-remove-btn')) {
    
  }
});

// populate filters
getFilters();
