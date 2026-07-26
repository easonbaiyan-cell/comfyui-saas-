from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(
            record_video_dir="test-results/",
            record_video_size={"width": 1280, "height": 720}
        )
        try:
            page.goto("http://localhost:3001/")
            page.wait_for_selector("text=一键生成爆款视频", timeout=15000)
            page.screenshot(path="test-results/engine_fix.png", full_page=True)
            print("Successfully loaded page and captured screenshot.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.close()
            browser.close()

if __name__ == "__main__":
    run()
