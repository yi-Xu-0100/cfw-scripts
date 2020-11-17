/**
 * @module notify
 * @description The function used for windows notify.
 */

const WindowsToaster = require('node-notifier').WindowsToaster;
var notifier = new WindowsToaster({
  withFallback: false // Fallback to Growl or Balloons?
});

let notify = async function (title, message, sound = true) {
  return notifier.notify(
    {
      title: title,
      message: message,
      sound: sound,
      appID: 'com.lbyczf.clashwin'
    },
    function (error, response) {
      console.log(`[info]: title: ${title}`);
      console.log(`[info]: message: ${message}`);
      console.log(`[info]: sound: ${sound}`);
      console.log(`[info]: notify response: ${response}`);
    }
  );
};

module.exports = { notify };
