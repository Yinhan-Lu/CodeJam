// Fetch and display history
function displayHistory() {
  chrome.storage.local.get(["vsbHistory"], function (result) {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";

    const history = result.vsbHistory || [];

    history.reverse().forEach((url, index) => {
      const item = document.createElement("div");
      item.className = "history-item";
      // Create a shorter display version of the URL
      const displayUrl = new URL(url);
      item.textContent = `Search ${history.length - index}`;

      item.addEventListener("click", () => {
        chrome.tabs.update({ url: url });
      });

      historyList.appendChild(item);
    });

    if (history.length === 0) {
      historyList.innerHTML = "<p>No history yet</p>";
    }
  });
}

// Load history when popup opens
document.addEventListener("DOMContentLoaded", displayHistory);
