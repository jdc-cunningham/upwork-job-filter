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

let filters = [];

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const msg = request;

  checkMsg(msg);
  callback('ui ack');
});

const checkMsg = (msg) => {
  if (msg?.filterList) {
    filters = filterList;
  }
};