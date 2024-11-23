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

// Export functionality
function exportHistory() {
  chrome.storage.local.get(["vsbHistory"], function (result) {
    const history = result.vsbHistory || [];
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Format current date and time as YYYY-MM-DD-HH-mm
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    const fileName = `${year}-${month}-${day}-${hour}-${minute} course schedule.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Import functionality
function importHistory(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedHistory = JSON.parse(e.target.result);
      if (Array.isArray(importedHistory)) {
        chrome.storage.local.get(["vsbHistory"], function (result) {
          const currentHistory = result.vsbHistory || [];
          // Merge imported history with current history
          const newHistory = [...currentHistory, ...importedHistory];
          // Remove duplicates based on URL and timestamp
          const uniqueHistory = Array.from(
            new Map(
              newHistory.map((item) => [`${item.url}-${item.timestamp}`, item])
            ).values()
          );

          chrome.storage.local.set({ vsbHistory: uniqueHistory }, function () {
            displayHistory();
            alert("History imported successfully!");
          });
        });
      } else {
        alert("Invalid file format!");
      }
    } catch (error) {
      alert("Error importing file: " + error.message);
    }
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", function () {
  displayHistory();

  // Export button handler
  document.getElementById("exportBtn").addEventListener("click", exportHistory);

  // Import button handler
  document.getElementById("importBtn").addEventListener("click", function () {
    document.getElementById("fileInput").click();
  });

  // File input change handler
  document.getElementById("fileInput").addEventListener("change", function (e) {
    if (e.target.files.length > 0) {
      importHistory(e.target.files[0]);
    }
  });
});
