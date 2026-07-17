from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Bypass auth using the memory instructions
    page.goto("http://localhost:3000/admin/workflows")
    page.evaluate("window.localStorage.setItem('bypass_admin', 'true');")
    page.goto("http://localhost:3000/admin/workflows")

    page.wait_for_timeout(2000)

    # Open category modal
    page.get_by_role("button", name="管理分类 (Manage Categories)").click()
    page.wait_for_timeout(1000)

    # Click edit on the first category
    page.get_by_title("编辑 (Edit)").first.click()
    page.wait_for_timeout(1000)

    page.screenshot(path="category_modal_edit.png")

    # Now check workflow edit page
    page.goto("http://localhost:3000/admin/workflows/edit/some-id")
    page.wait_for_timeout(2000)
    page.screenshot(path="workflow_edit_binding.png", full_page=True)

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
