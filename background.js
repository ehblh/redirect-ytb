// background.js

// Define a regular expression to match YouTube video URLs
const youtubeVideoRegex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/;

const redirectHost = "yewtu.be";
const redirectURLRegex = /^https?:\/\/(www\.)?yewtu\.be\/watch\?v=/;

const isLastPageRedirectURL = new Map();

// Function to check if a URL is a YouTube video page
function isYouTubeVideoPage(url) {
  return youtubeVideoRegex.test(url);
}

function isRedirectURL(url) {
  return redirectURLRegex.test(url);
}

// Function to update the host
function updateHostToMirrorSite(url) {
  const urlObject = new URL(url);
  urlObject.host = redirectHost;
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

  let isURLRedirected = isRedirectURL(url);

  if (
    // We only care about loading status
    changeInfo.status != "loading" ||
    // Youtube tab seems to have audible property turned off and then turned on, and we ignore the event of turning audible on
    tab.audible ||
    // Youtube tab will append channel name and update the tab if there is none in the url, and we ignore this reload
    url.includes("ab_channel") ||
    // We only care about the page when the url is youtobe video page
    !isYouTubeVideoPage(url)
  ) {
    isLastPageRedirectURL.set(tabId, isURLRedirected);
    return;
  }

  // We allow users to go back to youtube video page from redirected page
  if (isLastPageRedirectURL.get(tabId)) {
    isLastPageRedirectURL.set(tabId, isURLRedirected);
    return;
  }

  // Update the host to mirror site
  const updatedURL = updateHostToMirrorSite(url);

  // Log the host update
  console.log(`Updating host for tab ${tabId} to "yewtu.be"`);
  console.log("changeInfo", changeInfo);
  console.log("tab", tab);

  isLastPageRedirectURL.set(tabId, isURLRedirected);
  // Update the tab with the new URL
  chrome.tabs.update(tabId, { url: updatedURL });
}

// Listen for tab updates events
chrome.tabs.onUpdated.addListener(handleTabChange);
