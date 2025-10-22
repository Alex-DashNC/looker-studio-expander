(function() {
  let styleElement = null;

  // Default CSS template function
  function generateCSS(widthValue, minHeightValue) {
    return `
      /* Custom styles for Google Looker Studio editor */
      DIV.ng2-concept-menu.with-formula {
        width: ${widthValue}vw !important;
        max-width: calc(100vw - 107px) !important;
      }

      ._md-panel-shown .md-panel {
        right: 320px !important;
        left: auto !important;
        top: 104px !important;
      }

      .new-calculated-fields-container .formula-section .CodeMirror {
        min-height: ${minHeightValue}px !important;
      }
    `;
  }

  // Inject or update style element
  function updateStyles(enabled, widthValue, minHeightValue) {
    if (!enabled) {
      // Remove style if it exists
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
      styleElement = null;
      return;
    }

    // Create style element if it doesn't exist
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = generateCSS(widthValue, minHeightValue);
  }

  // Initialize with stored settings
  chrome.storage.sync.get(['cssEnabled', 'customWidth', 'customMinHeight'], (data) => {
    const enabled = (typeof data.cssEnabled === 'boolean') ? data.cssEnabled : true;
    const widthValue = (typeof data.customWidth === 'number') ? data.customWidth : 68;
    const minHeightValue = (typeof data.customMinHeight === 'number') ? data.customMinHeight : 600;
    updateStyles(enabled, widthValue, minHeightValue);
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    chrome.storage.sync.get(['cssEnabled', 'customWidth', 'customMinHeight'], (data) => {
      const enabled = (typeof data.cssEnabled === 'boolean') ? data.cssEnabled : true;
      const widthValue = (typeof data.customWidth === 'number') ? data.customWidth : 68;
      const minHeightValue = (typeof data.customMinHeight === 'number') ? data.customMinHeight : 600;
      
      if (msg.action === 'toggleCSS') {
        updateStyles(msg.enabled, widthValue, minHeightValue);
      } else if (msg.action === 'updateWidth') {
        updateStyles(enabled, msg.width, minHeightValue);
      } else if (msg.action === 'updateMinHeight') {
        updateStyles(enabled, widthValue, msg.height);
      }
    });
  });
})();
