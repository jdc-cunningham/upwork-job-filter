chrome.runtime.onMessage.addListener((request, sender, callback) => {
  console.log('dom', request);
  sendMessageToLogic('from dom');
});

const sendMessageToLogic = (msg) => {
  chrome.runtime.sendMessage(msg);
}