document.addEventListener('DOMContentLoaded', function() {
  const toggleCheckbox = document.getElementById('toggle-css');
  const widthSlider = document.getElementById('widthSlider');
  const widthValue = document.getElementById('widthValue');
  const heightSlider = document.getElementById('heightSlider');
  const heightValue = document.getElementById('heightValue');

  // Debounce timers
  let widthDebounceTimer = null;
  let heightDebounceTimer = null;

  // Helper function to safely send message to content script
  function sendMessageToTab(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0]) return;
      
      const url = tabs[0].url;
      // Only send message if we're on a Looker Studio page
      if (url && (url.startsWith('https://datastudio.google.com/') || url.startsWith('https://lookerstudio.google.com/'))) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
          // Handle any errors silently
          if (chrome.runtime.lastError) {
            console.log('Extension message:', chrome.runtime.lastError.message);
          }
        });
      }
    });
  }

  // Load saved preferences
  chrome.storage.sync.get(['cssEnabled', 'customWidth', 'customMinHeight'], (data) => {
    toggleCheckbox.checked = (typeof data.cssEnabled === 'boolean') ? data.cssEnabled : true;
    widthSlider.value = (typeof data.customWidth === 'number') ? data.customWidth : 68;
    widthValue.textContent = widthSlider.value;
    heightSlider.value = (typeof data.customMinHeight === 'number') ? data.customMinHeight : 600;
    heightValue.textContent = heightSlider.value;
  });

  // Toggle changes
  toggleCheckbox.addEventListener('change', () => {
    const enabled = toggleCheckbox.checked;
    chrome.storage.sync.set({ cssEnabled: enabled }, () => {
      if (chrome.runtime.lastError) {
        console.log('Storage error:', chrome.runtime.lastError.message);
        return;
      }
      sendMessageToTab({ action: 'toggleCSS', enabled: enabled });
    });
  });

  // Width slider changes - update display and CSS immediately, debounce storage writes
  widthSlider.addEventListener('input', () => {
    const newWidth = parseInt(widthSlider.value, 10);
    widthValue.textContent = newWidth;
    
    // Update CSS immediately for smooth experience
    sendMessageToTab({ action: 'updateWidth', width: newWidth });
    
    // Clear existing timer
    if (widthDebounceTimer) {
      clearTimeout(widthDebounceTimer);
    }
    
    // Debounce storage writes to avoid quota errors
    widthDebounceTimer = setTimeout(() => {
      chrome.storage.sync.set({ customWidth: newWidth }, () => {
        if (chrome.runtime.lastError) {
          console.log('Storage error:', chrome.runtime.lastError.message);
        }
      });
    }, 300);
  });

  // Height slider changes - update display and CSS immediately, debounce storage writes
  heightSlider.addEventListener('input', () => {
    const newHeight = parseInt(heightSlider.value, 10);
    heightValue.textContent = newHeight;
    
    // Update CSS immediately for smooth experience
    sendMessageToTab({ action: 'updateMinHeight', height: newHeight });
    
    // Clear existing timer
    if (heightDebounceTimer) {
      clearTimeout(heightDebounceTimer);
    }
    
    // Debounce storage writes to avoid quota errors
    heightDebounceTimer = setTimeout(() => {
      chrome.storage.sync.set({ customMinHeight: newHeight }, () => {
        if (chrome.runtime.lastError) {
          console.log('Storage error:', chrome.runtime.lastError.message);
        }
      });
    }, 300);
  });
});
