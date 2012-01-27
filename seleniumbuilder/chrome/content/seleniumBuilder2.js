// Establish bridge namespace.
var bridge = {};
/** The tab node that is highlighted green (can be used to get a reference to the content). */
bridge.recordingTab = null;
/** The window we're recording in, if different from the one in the recordingTab. */
bridge.customRecordingWindow = null;
/** The window that contains the recorder. */
bridge.recorderWindow = null;
/** Document load listeners, mapped from window to listener. */
bridge.docLoadListeners = {};

/** Set an alternate window to record in that's not the window of the recordingTab. */
bridge.setCustomRecordingWindow = function(newWindow) {
  bridge.customRecordingWindow = newWindow;
};

/** @return The content window we're recording in. */
bridge.getRecordingWindow = function() {
  if (bridge.customRecordingWindow) { return customRecordingWindow; }
  return getBrowser().getBrowserForTab(bridge.recordingTab).contentWindow;
};

/** @return The main browser window we're recording in. */
bridge.getBrowser = function() {
  return window;
};

/**
 * Add a listener to be notified when the document in win changes. There can only be one
 * listener per window. (Though the code can be easily improved using arrays and splicing
 * if this becomes a problem.)
 */ 
bridge.addDocLoadListener = function(win, l) {
  bridge.docLoadListeners[win] = l;
};

bridge.removeDocLoadListener = function(win, l) {
  delete bridge.docLoadListeners[win];
};

bridge.boot = function() {
  // Save the tab the user has currently open: it's the one we'll record from.
  bridge.recordingTab = getBrowser().mCurrentTab;

  // Make it obvious which tab is recording by turning it green!
  bridge.recordingTab.style.setProperty("background-color", "#ccffcc", "important");
  
  bridge.recorderWindow = window.open("chrome://seleniumbuilder/content/html/gui.html", "seleniumbuilder", "width=550,height=600,toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=yes,copyhistory=no,resizable=yes");
    
  // Install a listener with the browser to be notified when a new document is loaded.
  try {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(
        Components.interfaces.nsIObserverService);
    var observer = {
      observe: function (win) {
        if (bridge.docLoadListeners[win]) {
          bridge.docLoadListeners[win]();
        }
      }
    };
    observerService.addObserver(observer, "content-document-global-created", false);
  } catch (e) {
    dump(e);
  }
  
  bridge.booter = setInterval(function() {
    if (bridge.recorderWindow.wrappedJSObject.boot) {
      bridge.recorderWindow.wrappedJSObject.boot(bridge);
      clearInterval(bridge.booter);
    }
  }, 100);
};