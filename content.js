console.log("VSB Helper content script loaded");

function createVSBButton() {
  console.log("Creating VSB button...");
  const button = document.createElement("button");
  button.innerHTML = "Save VSB State";
  button.id = "vsb-helper-button";
  button.className = "vsb-helper-btn";

  button.addEventListener("click", function () {
    // Save current URL to history
    chrome.storage.local.get(["vsbHistory"], function (result) {
      let history = result.vsbHistory || [];
      const currentUrl = window.location.href;

      // Don't add if it's the same as the last entry
      if (history.length === 0 || history[history.length - 1] !== currentUrl) {
        // Keep only last 10 entries
        if (history.length >= 10) {
          history = history.slice(-9);
        }
        history.push(currentUrl);
        chrome.storage.local.set({ vsbHistory: history }, function () {
          alert("Current VSB state saved!");
        });
      } else {
        alert("This state is already saved!");
      }
    });
  });

  // Add to body if target element not found
  const targetElement =
    document.querySelector("#criteria-main") || document.body;
  targetElement.prepend(button);

  console.log("Button created and added to page");
}

// Check if we're on VSB page and inject the button
if (window.location.hostname.includes("vsb.mcgill.ca")) {
  console.log("On VSB website, waiting for page load");
  // Try both load event and immediate execution
  if (document.readyState === "loading") {
    window.addEventListener("load", createVSBButton);
  } else {
    createVSBButton();
  }
}
