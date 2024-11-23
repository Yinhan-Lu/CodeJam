function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function displayHistory() {
  chrome.storage.local.get(["vsbHistory"], function (result) {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";

    const history = result.vsbHistory || [];

    history.reverse().forEach((item, index) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";

      // Create container for timestamp
      const timeDiv = document.createElement("div");
      timeDiv.className = "time-text";
      timeDiv.textContent = formatDateTime(item.timestamp);

      // Create delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";

      // Add click handlers
      timeDiv.addEventListener("click", () => {
        chrome.tabs.update({ url: item.url });
      });

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const originalIndex = history.length - 1 - index;
        history.splice(originalIndex, 1);
        chrome.storage.local.set({ vsbHistory: history }, () => {
          historyItem.remove();
          if (history.length === 0) {
            historyList.innerHTML = "<p>No history yet</p>";
          }
        });
      });

      historyItem.appendChild(timeDiv);
      historyItem.appendChild(deleteBtn);
      historyList.appendChild(historyItem);
    });

    if (history.length === 0) {
      historyList.innerHTML = "<p>No history yet</p>";
    }
  });
}

document.addEventListener("DOMContentLoaded", displayHistory);
