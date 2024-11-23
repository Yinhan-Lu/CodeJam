console.log("VSB Helper content script loaded");

function createVSBButton() {
  console.log("Creating VSB button...");
  const button = document.createElement("button");
  button.innerHTML = "Save VSB State";
  button.id = "vsb-helper-button";
  button.className = "vsb-helper-btn";

  button.addEventListener("click", function () {
    chrome.storage.local.get(["vsbHistory"], function (result) {
      let history = result.vsbHistory || [];
      const currentUrl = window.location.href;
      const currentTime = Date.now();

      const newEntry = {
        url: currentUrl,
        timestamp: currentTime,
      };

      if (
        history.length === 0 ||
        history[history.length - 1].url !== currentUrl
      ) {
        if (history.length >= 10) {
          history = history.slice(-9);
        }
        history.push(newEntry);
        chrome.storage.local.set({ vsbHistory: history }, function () {
          alert("Current VSB state saved!");
        });
      } else {
        alert("This state is already saved!");
      }
    });
  });

  const targetElement =
    document.querySelector("#criteria-main") || document.body;
  targetElement.prepend(button);

  console.log("Button created and added to page");
}

if (window.location.hostname.includes("vsb.mcgill.ca")) {
  console.log("On VSB website, waiting for page load");
  if (document.readyState === "loading") {
    window.addEventListener("load", createVSBButton);
  } else {
    createVSBButton();
  }
}
