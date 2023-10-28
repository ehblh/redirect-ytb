// background.js

// Define a regular expression to match YouTube video URLs
const youtubeVideoRegex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/;

const mirrorVideoRegex = /^https?:\/\/(www\.)?yewtu\.be\/watch\?v=/;

const lastPageURL = new Map();
// Function to check if a URL is a YouTube video page
function isYouTubeVideoPage(url) {
  return youtubeVideoRegex.test(url);
}

function isMirrorYoutubePage(url) {
  return mirrorVideoRegex.test(url);
}

// Function to update the host to "yewtu.be"
function updateHostToYewtuBe(url) {
  const urlObject = new URL(url);
  urlObject.host = "yewtu.be";
  return urlObject.href;
}


// Function to handle URL updates
function handleTabChange(tabId, changeInfo, tab) {
  let url = changeInfo.url;
  if (
    changeInfo.status != "loading" ||
    // Youtube seems to be loading something else when loading the video
    url == undefined ||
    // Youtube tab seems to have audible property turned off and then turned on
    tab.audible ||
    // Youtube tab will append channel name and reload the tag if there is none in the url
    url.includes("ab_channel") ||
    // We care the page when the url is youtobe video page
    !isYouTubeVideoPage(url)
  ) {
    // record this url as last page url as this tab
    lastPageURL.set(tabId, url);
    return;
  }
  // we allow people to go back to youtube video page when last url is mirror youtube site url
  var lastURL = lastPageURL.get(tabId);
  if (lastURL != undefined && isMirrorYoutubePage(lastURL)) {
    lastPageURL.set(tabId, url);
    return;
  }

  // Update the host to "yewtu.be"
  const updatedURL = updateHostToYewtuBe(url);

  // Log the host update
  console.log(`Updating host for tab ${tabId} to "yewtu.be"`);
  console.log("changeInfo", changeInfo);
  console.log("tab", tab);
  lastPageURL.set(tabId, url);

  // Update the tab with the new URL
  chrome.tabs.update(tabId, { url: updatedURL });
}

// Listen for webNavigation events on tab URL changes
chrome.tabs.onUpdated.addListener(handleTabChange);
