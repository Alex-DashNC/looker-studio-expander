document.addEventListener('DOMContentLoaded', function() {
  const toggleCheckbox = document.getElementById('toggle-css');
  const widthSlider = document.getElementById('widthSlider');
  const widthValue = document.getElementById('widthValue');
  const heightSlider = document.getElementById('heightSlider');
  const heightValue = document.getElementById('heightValue');

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
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleCSS', enabled: enabled });
      });
    });
  });

  // Width slider changes
  widthSlider.addEventListener('input', () => {
    const newWidth = parseInt(widthSlider.value, 10);
    widthValue.textContent = newWidth;
    chrome.storage.sync.set({ customWidth: newWidth }, () => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'updateWidth', width: newWidth });
      });
    });
  });

  // Height slider changes
  heightSlider.addEventListener('input', () => {
    const newHeight = parseInt(heightSlider.value, 10);
    heightValue.textContent = newHeight;
    chrome.storage.sync.set({ customMinHeight: newHeight }, () => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'updateMinHeight', height: newHeight });
      });
    });
  });
});
