const sendMessageToLogic = (msg) => {
  chrome.runtime.sendMessage(msg);
}

const sendMessageToDomFilter = (msg) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
      // not doing anything with response yet
      console.log(response);
    });  
  });
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const { message } = request;

  console.log('bg', message);

  sendMessageToDomFilter('yo');

  if (message?.getFilters) {
    sendMessageToLogic('from bg');
    // sendMessageToLogic(getFilters());
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