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

const renderFilters = (filters) => {
  filterDisplay.innerHTML = filters.map(filter => createFilterItem(filter)).join('');
}

const sendMessageToDomFilter = (msg) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
      // not doing anything with response yet
    });
  });
}

const getFilters = () => {
  sendMessageToDomFilter({
    getFilters: true
  });
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const msg = request;

  if (msg?.filters) {
    renderFilters(msg.filters);
  }

  callback('logic ack');
});

document.addEventListener('click', (e) => {
  if (e.target.getAttribute('id') === 'add-filter-btn') {
    const filter = filterInput.value;

    if (!filter.length) return;

    sendMessageToDomFilter({
      addFilter: true,
      filter,
    });

    filterInput.value = '';
  }

  if (Array.from(e.target.classList).includes('container__body-row-item-remove-btn')) {
    sendMessageToDomFilter({
      removeFilter: true,
      filter: e.target.parentNode.querySelector('h3').innerText
    });
  }
});

getFilters();
