const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Mock the HTML structure and JS
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="resTitle">video</div>
        <button id="dl1" class="dl-btn" data-idx="0">Download</button>
        <script>
          window._currentFormats = [{
            isWidget: true,
            url: "https://loader.to/api/button/?url=https://www.youtube.com/watch?v=jNQXAC9IVRw&f=1080&color=d8b4fe"
          }];
          
          function handleDownloadClick(btn, fmt) {
            if (fmt.isWidget) {
              var modalId = 'widgetModal_' + Date.now();
              var modalHtml = '<div id="' + modalId + '" class="test-modal">Test Modal</div>';
              document.body.insertAdjacentHTML('beforeend', modalHtml);
              console.log("Modal injected!");
              return;
            }
          }
          
          document.getElementById('dl1').addEventListener('click', function(e) {
            var btn = e.target.closest('.dl-btn');
            var idx = parseInt(btn.getAttribute('data-idx'), 10);
            var fmt = window._currentFormats[idx];
            handleDownloadClick(btn, fmt);
          });
        </script>
      </body>
    </html>
  `);
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  await page.click('#dl1');
  
  // Check if modal exists
  const modalCount = await page.locator('.test-modal').count();
  console.log("Modal count in DOM:", modalCount);
  await browser.close();
})();
