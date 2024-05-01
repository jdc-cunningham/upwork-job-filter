// this file runs on page load

const getBanner = () => document.querySelector('.announcements');

const waitForBanner = () => new Promise(resolve => {
  const wait = () => {
    const banner = getBanner();

    if (banner) {
      resolve(banner);
    } else {
      setTimeout(() => {
        wait();
      }, 100);
    }
  }

  wait();
});

// remove upwork announcement banner
const removeUpworkBanner = async () => {
  await waitForBanner();
  document.querySelector('.announcements').classList += 'ce-hidden';
};

// this seems redundant but if you remove the banner right away, it adds itself back
// actually removing the dom node breaks the loading of jobs
setTimeout(() => {
  removeUpworkBanner();
}, 3000);

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

const checkMsg = (msg) => {
  if (msg?.getFilters) {
    sendMessageToLogic(getFilters());
  }
};

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const msg = request;

  console.log('dom', msg);

  checkMsg(msg);

  callback('dom ack');
});
