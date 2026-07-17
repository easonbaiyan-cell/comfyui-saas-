from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # We will just verify the workflow edit page to see if binding works
    page.goto("http://localhost:3000/admin/workflows")
    page.evaluate("window.localStorage.setItem('bypass_admin', 'true');")

    # Try workflow edit page directly for binding test
    page.goto("http://localhost:3000/admin/workflows/edit/dummy-id")
    page.wait_for_timeout(2000)

    page.screenshot(path="workflow_edit_binding.png", full_page=True)

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
