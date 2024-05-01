const getFilters = () => {
  const localStorageFilters = localStorage.getItem('upwork-job-filters');

  let filters = ['test'];

  if (localStorageFilters) {
    filters = JSON.parse(localStorageFilters);
  }

  return {
    filters,
  };
};

const addFilter = (filter) => {
  const localStorageFilters = localStorage.getItem('upwork-job-filters');

  if (localStorageFilters) {
    const filters = JSON.parse(localStorageFilters);

    filters.push(filter);
    localStorage.setItem('upwork-job-filters', JSON.stringify(filters));
  } else {
    localStorage.setItem('upwork-job-filters', JSON.stringify([filter]));
  }
};

const removeFilter = (removeFilter) => {
  const localStorageFilters = localStorage.getItem('upwork-job-filters');

  if (localStorageFilters) {
    const filters = JSON.parse(localStorageFilters);
    localStorage.setItem('upwork-job-filters', JSON.stringify(filters.filter(filter => filter !== removeFilter)));
  }
};

const sendMessageToLogic = (msg) => {
  chrome.runtime.sendMessage(msg);
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const { message } = request;

  console.log(message);

  if (message?.getFilters) {
    sendMessageToLogic(getFilters());
  }

  if (message?.type === 'update-filter') {
    if (message?.action === 'add') {
      addFilter(msg.filter)
    }

    if (message?.action === 'remove') {
      removeFilter(msg.filter);
    }
  }

  console.log('bg', request);

  callback('bg ack');
});
