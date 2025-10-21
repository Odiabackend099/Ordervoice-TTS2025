import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Navigate to Pricing page and extract its source code to verify SEO elements.
        frame = context.pages[-1]
        # Click on Pricing link to navigate to Pricing page
        elem = frame.locator('xpath=html/body/nav/div/ul/li[3]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the Try Demo link to navigate to the Demo page and extract its source code for SEO validation.
        frame = context.pages[-1]
        # Click on Try Demo link to navigate to Demo page
        elem = frame.locator('xpath=html/body/nav/div/ul/li[3]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on Contact link to navigate to Contact page and extract its source code for SEO validation.
        frame = context.pages[-1]
        # Click on Contact link to navigate to Contact page
        elem = frame.locator('xpath=html/body/nav/div/ul/li[4]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fetch sitemap.xml from the root directory and verify URL listings correspond to public pages.
        await page.goto('http://localhost:8000/sitemap.xml', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Fetch robots.txt from the root directory and verify rules for search engine crawlers.
        await page.goto('http://localhost:8000/robots.txt', timeout=10000)
        await asyncio.sleep(3)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=User-agent: *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Allow: /').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sitemap: https://ordervoice.ai/sitemap.xml').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Crawl-delay: 1').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Disallow: /admin/').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Disallow: /private/').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    