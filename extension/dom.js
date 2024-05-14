// this file runs in the same context as upwork's front end eg. devtools

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

const filterMatched = (job, text) => domFilters.some(domFilter => {
  if (text.toLowerCase().includes(domFilter.toLowerCase())) {
    addFailStamp(job, domFilter);
  }

  // can check things here
  return text.toLowerCase().includes(domFilter.toLowerCase());
});

// why the job was ignored
const addFailStamp = (jobEl, reason) => {
  const curText = jobEl.querySelector('.fail-reason').innerText;

  if (!curText.includes(reason)) {
    jobEl.querySelector('.fail-reason').innerText += curText.length ? ' ' + reason : reason;
  }
}

const checkPay = (job, jobTitle, jobPayText) => {
  const minHourlyRate = 50;
  const minFixedPriceRate = 100;

  try {
    const hourlyJob = jobPayText.includes('hourly');

    if (hourlyJob) {
      if (jobPayText.includes('hourly:')) {
        const budget = jobPayText.split('hourly: ')[1].split(' - ')[0];
        const budgetRange = budget.replaceAll('$', '').split('-');
        
        if (parseInt(budgetRange[1]) >= minHourlyRate) {
          return true;
        } else {
          addFailStamp(job, 'low hourly pay');
          return false;
        }
      }
    } else {
      if (jobPayText.includes('budget: $')) {
        const budget = jobPayText.split('budget: $')[1].replace(',', '');

        if (parseFloat(budget) >= minFixedPriceRate) {
          return true;
        } else {
          addFailStamp(job, 'low fixed price');
          return false;
        }
      }
    }

    addFailStamp(job, 'unknown budget');
    return false;
  } catch (e) {
    alert('Failed to check job budget' + '\n' + jobTitle + '\n' + jobPayText);
    console.log(jobTitle, jobPayText);
    console.error(e);
  }
}

const addFailContainer = (job) => {
  if (!job.querySelector('.fail-reason')) {
    job.style.position = 'relative'; // for added elements with absolute positioning
    job.innerHTML += '<div class="fail-reason"></div>';
  }
}

const applyFilters = () => {
  // stuff to look at: job title, description, tags
  Array.from(document.querySelectorAll('div[data-test="job-tile-list"] section')).forEach(job => {
    addFailContainer(job);

    // check job context
    const jobTitle = job.querySelector('h3.job-tile-title').innerText;
    const jobDescription = job.querySelector('div.text-body').innerText;
    const jobTags = Array.from(job.querySelectorAll('a.air3-token')).map(jobTag => jobTag.innerText).join(',');

    // check pay info
    const budgetText = job.querySelector('.text-light.display-inline-block.text-caption').innerText.toLowerCase();
    const payRateMet = checkPay(job, jobTitle, budgetText);

    if ([jobTitle, jobDescription, jobTags].some(jobText => (filterMatched(job, jobText) || !payRateMet))) {
      job.style.opacity = 0.15;
      job.style.maxHeight = '150px';
      job.style.overflow = 'auto';
    }
  });
}

// this is an injected clock that starts counting upwards
// after the page loads it's for the most recent feed
const injectTimeDisplay = () => {
  const newDiv = document.createElement("div");
  newDiv.setAttribute('id', 'elapsed-time');
  newDiv.setAttribute('class', 'elapsed-time');
  newDiv.setAttribute('title', 'since last refresh');

  document.body.appendChild(newDiv);
}

let timeDisp;
const startTime = Date.now();

const updateTime = (formattedTime) => timeDisp.innerText = formattedTime;

const leadingZeroCheck = (seconds) => {
	if (seconds < 10) {
    return `0${seconds}`;
  } else {
    return seconds;
  }
}

const formatTime = (elapsedSeconds) => {
	if (elapsedSeconds >= 60) {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;

    return `${leadingZeroCheck(mins)}:${leadingZeroCheck(secs)}`;
  } else {
  	return `0:${leadingZeroCheck(elapsedSeconds)}`;
  }
}

const startElapsedTimer = () => {
  injectTimeDisplay();
  timeDisp = document.getElementById('elapsed-time'); 

  setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    updateTime(formatTime(elapsedTime));
  }, 1000);
}


window.onload = () => {
  applyFilters();
  startElapsedTimer();
}

document.addEventListener('scrollend', () => {
  applyFilters();
});

getFilters();
applyFilters();
