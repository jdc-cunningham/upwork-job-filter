const sendMessageToDomFilter = (msg) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
      // not doing anything with response yet
      console.log(response);
    });  
  });
}

sendMessageToDomFilter('from logic');

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  console.log('logic', request);
});
