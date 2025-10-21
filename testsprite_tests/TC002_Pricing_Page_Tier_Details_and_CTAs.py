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
        # -> Click on the Pricing link in the top navigation to go to the Pricing page.
        frame = context.pages[-1]
        # Click on the Pricing link in the top navigation to navigate to the Pricing page.
        elem = frame.locator('xpath=html/body/nav/div/ul/li[3]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Scroll down to locate and verify the FAQs section on the Pricing page.
        await page.mouse.wheel(0, 800)
        

        # -> Test that CTAs (Start Free Trial and Contact Sales buttons) are clickable and initiate the expected workflow.
        frame = context.pages[-1]
        # Click Start Free Trial button under Starter plan to test CTA functionality.
        elem = frame.locator('xpath=html/body/div/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Contact Sales' button under the Business plan to verify it is clickable and initiates the expected workflow.
        frame = context.pages[-1]
        # Click the 'Contact Sales' button under the Business plan to test CTA functionality.
        elem = frame.locator('xpath=html/body/div/div/div[3]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Starter (₦40,000/month)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pro (₦95,000/month)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Business (₦220,000/month)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=We Contact You - Within 1 hour to discuss your needs').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Quick Setup - We configure OrderVoice for your business').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Go Live - Your AI receptionist answers calls within 24 hours').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Free Trial - Use it free for 7 days, no card needed').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Submit & Start Free Trial →').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Contact us to start your 7-day free trial or ask any questions. We typically respond within 1 hour.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    