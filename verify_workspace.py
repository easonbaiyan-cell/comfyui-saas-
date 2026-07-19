from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to the workspace page
    page.goto("http://localhost:3000/workspace")
    page.wait_for_timeout(3000)

    # Take a screenshot to verify the UI
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
