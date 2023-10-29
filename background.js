// background.js

// Define a regular expression to match YouTube video URLs
const youtubeVideoRegex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/;

const mirrorSite = "yewtu.be";
const mirrorVideoRegex = /^https?:\/\/(www\.)?yewtu\.be\/watch\?v=/;

const isLastPageMirrorSite = new Map();

// Function to check if a URL is a YouTube video page
function isYouTubeVideoPage(url) {
  return youtubeVideoRegex.test(url);
}

function isMirrorYoutubePage(url) {
  return mirrorVideoRegex.test(url);
}

// Function to update the host to mirror site
function updateHostToMirrorSite(url) {
  const urlObject = new URL(url);
  urlObject.host = mirrorSite;
  return urlObject.href;
}

// Function to handle URL updates
function handleTabChange(tabId, changeInfo, tab) {
  let url = changeInfo.url;

  if (
    // Youtube seems to be loading something else when loading the video
    url == undefined
  ) {
    return;
  }

  let isURLMirrorSite = isMirrorYoutubePage(url);

  if (
    // We only care loading status
    changeInfo.status != "loading" ||
    // Youtube tab seems to have audible property turned off and then turned on, and  we ignore the event of turning audible on
    tab.audible ||
    // Youtube tab will append channel name and reload the page if there is none in the url, and we ignore this reload
    url.includes("ab_channel") ||
    // We care the page when the url is youtobe video page
    !isYouTubeVideoPage(url)
  ) {
    isLastPageMirrorSite.set(tabId, isURLMirrorSite);
    return;
  }

  // we allow people to go back to youtube video page when last url is mirror youtube site url
  if (isLastPageMirrorSite.get(tabId)) {
    isLastPageMirrorSite.set(tabId, isURLMirrorSite);
    return;
  }

  // Update the host to mirror site
  const updatedURL = updateHostToMirrorSite(url);

  // Log the host update
  console.log(`Updating host for tab ${tabId} to "yewtu.be"`);
  console.log("changeInfo", changeInfo);
  console.log("tab", tab);

  isLastPageMirrorSite.set(tabId, isURLMirrorSite);
  // Update the tab with the new URL
  chrome.tabs.update(tabId, { url: updatedURL });
}

// Listen for tab updates events
chrome.tabs.onUpdated.addListener(handleTabChange);
