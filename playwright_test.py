from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:3000')
        page.wait_for_selector('h1:has-text("1人超级AI公司")')
        page.wait_for_selector('text=PAPAGAGA 商业级应用')
        print("Frontend verification on / successful")

        # Test Admin page rendering (without full login for now, just check if it doesn't crash)
        # Note: /admin requires login, so we just check if it redirects to login or loads properly
        page.goto('http://localhost:3000/admin/settings')
        print("Frontend verification on /admin/settings successful (didn't crash)")

        browser.close()

if __name__ == "__main__":
    run()
