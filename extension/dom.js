let domFilters = [];

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
  let filters = [];
  
  const localStorageFilters = localStorage.getItem('upwork-job-filters');

  if (localStorageFilters) {
    filters = JSON.parse(localStorageFilters);
  }

  domFilters = filters;

  return filters;
}

const addFilter = (filter) => {
  const filters = getFilters();

  filters.push(filter);

  localStorage.setItem('upwork-job-filters', JSON.stringify(filters));

  domFilters = filters;

  sendMessageToLogic({
    filters
  });
}

const removeFilter = (removeFilter) => {
  let filters = getFilters();

  filters = filters.filter(filter => filter !== removeFilter);

  localStorage.setItem('upwork-job-filters', JSON.stringify(filters));

  domFilters = filters;

  sendMessageToLogic({
    filters
  });
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const msg = request;

  if (msg?.getFilters) {
    sendMessageToLogic({
      filters: getFilters()
    });
  }

  if (msg?.addFilter) {
    addFilter(msg?.filter)
  }

  if (msg?.removeFilter) {
    removeFilter(msg?.filter);
  }

  // sendMessageToLogic('from dom');
  callback('dom ack');
});

const sendMessageToLogic = (msg) => {
  chrome.runtime.sendMessage(msg);
}

const filterMatched = (text) => domFilters.some(domFilter => text.toLowerCase().includes(domFilter.toLowerCase()));

const applyFilters = () => {
  // stuff to look at: job title, description, tags
  const myRate = 40; // hourly
  const minFixedPriceRate = 100;

  Array.from(document.querySelectorAll('div[data-test="job-tile-list"] section')).forEach(job => {
    const jobTitle = job.querySelector('h3.job-tile-title').innerText;
    const jobDescription = job.querySelector('div.text-body').innerText;
    const jobTags = Array.from(job.querySelectorAll('a.air3-token')).map(jobTag => jobTag.innerText).join(',');
    const fixedPayType = job.querySelector('strong[data-test="job-type"]')?.innerText.includes('fixed');
    const fixedPayRate = fixedPayType ? parseInt(job.querySelector('strong[data-test="budget"')?.innerText.split('$')[1]) : 0;
    const hourlyRate = !fixedPayType ? job.querySelector('strong[data-test="job-type"]').innerText : 0;
    // const rateMet = (fixedPayType && fixedPayRate >= minFixedPriceRate) || (hourlyRate && hourlyRate.includes('$') && parseInt(hourlyRate.split('Hourly: ')[1].split('-')[1].split('$')[1]) >= myRate);

    if ([jobTitle, jobDescription, jobTags].some(jobText => (filterMatched(jobText)))) {
      job.style.opacity = 0.15;
      job.style.maxHeight = '150px';
      job.style.overflow = 'auto';
    }
  });
}

document.addEventListener('scrollend', () => {
  applyFilters();
});

getFilters();
applyFilters();
