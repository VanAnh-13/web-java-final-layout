import time
import unittest

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager


class CSVTestResult(unittest.TextTestResult):
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.csv_writer = None  # Sẽ được thiết lập khi chạy test
        self.current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.successes = []  # List to store successful tests

    def addSuccess(self, test):
        if self.csv_writer:
            self.csv_writer.writerow([self.current_time, test.id(), 'SUCCESS', ''])
            self.successes.append(test)  # Store successful test
        super().addSuccess(test)

    def addFailure(self, test, err):
        if self.csv_writer:
            error_message = str(err[1])  # Get error message
            self.csv_writer.writerow([self.current_time, test.id(), 'FAILURE', error_message])
        super().addFailure(test, err)

    def addError(self, test, err):
        if self.csv_writer:
            error_message = str(err[1])  # Get error message
            self.csv_writer.writerow([self.current_time, test.id(), 'ERROR', error_message])
        super().addError(test, err)


class HomePageTest(unittest.TestCase):
    def setUp(self):
        # Thiết lập Chrome WebDriver
        options = Options()
        options.headless = True
        options.add_argument("--no-sandbox")

        try:
            chromedriver_path = ChromeDriverManager().install()
        except ValueError as e:
            # Xử lý lỗi nếu có (ví dụ: API rate limit khi tải chromedriver từ nguồn không chính thức)
            print(f"Lỗi khi tải/cài đặt chromedriver: {e}")
            print("Vui lòng đảm bảo Chrome đã được cài đặt và chromedriver có thể được tải xuống.")
            print("Bạn có thể cần đặt biến môi trường WDM_SSL_VERIFY=0 nếu gặp lỗi SSL.")
            print("Hoặc tải chromedriver thủ công và đặt vào PATH / chỉ định đường dẫn.")
            # Ví dụ: chromedriver_path = "/usr/local/bin/chromedriver"
            raise e
        self.driver = webdriver.Chrome(service=Service(executable_path=chromedriver_path), options=options)
        self.driver.maximize_window()
        self.base_url = "http://localhost:4200"

    def tearDown(self):
        self.driver.quit()

    def test_home_page_loads(self):
        # Mở trang home
        self.driver.get(self.base_url)
        # Chờ để tiêu đề chính hiển thị
        heading = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.TAG_NAME, "h1"))
        )
        # Cho phép ngắt dòng giữa "Your" và "Perfect"
        self.assertRegex(heading.text, r"Find Your\s+Perfect Backpack")

    def test_shop_now_redirects_to_login(self):
        # Mở trang home và nhấn nút Shop Now
        self.driver.get(self.base_url)
        # Tìm nút Shop Now qua thuộc tính routerLink
        shop_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[routerLink='/login']"))
        )
        shop_button.click()
        # Chờ URL chuyển sang /login
        WebDriverWait(self.driver, 10).until(
            lambda d: "/login" in d.current_url
        )
        self.assertIn("/login", self.driver.current_url)

    def test_featured_products_display(self):
        # Mở trang home và xác nhận danh sách sản phẩm nổi bật
        self.driver.get(self.base_url)
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )
        products = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")
        self.assertGreaterEqual(len(products), 1)

    def test_view_all_products(self):
        # Mở trang xem tất cả sản phẩm và xác nhận danh sách sản phẩm
        self.driver.get(f"{self.base_url}/products")
        # Chờ tiêu đề "All Products" hiển thị
        heading = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.TAG_NAME, "h1"))
        )
        self.assertIn("All Products", heading.text)
        # Chờ ít nhất một thẻ sản phẩm hiển thị
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )
        products = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")
        self.assertGreaterEqual(len(products), 1, "No products found on view all products page")

    def test_register_success_redirects_to_login(self):
        # Mở trang signup và điền thông tin đăng ký
        self.driver.get(f"{self.base_url}/signup")
        # Điền form
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "name"))
        )
        self.driver.find_element(By.ID, "name").send_keys("Test User")
        self.driver.find_element(By.ID, "email").send_keys("testuser@example.com")
        self.driver.find_element(By.ID, "password").send_keys("Pass123!")
        self.driver.find_element(By.ID, "confirmPassword").send_keys("Pass123!")
        # Submit form
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        # Chờ redirect sang trang login
        WebDriverWait(self.driver, 10).until(
            lambda d: "/login" in d.current_url
        )
        self.assertIn("/login", self.driver.current_url)

    def test_register_and_login(self):
        # Tạo thông tin người dùng ngẫu nhiên để tránh trùng lặp
        timestamp = int(time.time())
        unique_email = f"testuser{timestamp}@example.com"
        password = "Pass123!"

        # Đăng ký
        self.driver.get(f"{self.base_url}/signup")
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "name"))
        )
        self.driver.find_element(By.ID, "name").send_keys("Test User")
        self.driver.find_element(By.ID, "email").send_keys(unique_email)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.ID, "confirmPassword").send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        WebDriverWait(self.driver, 10).until(
            lambda d: "/login" in d.current_url
        )
        self.assertIn("/login", self.driver.current_url, "Register failed or did not redirect to login")

        # Đăng nhập
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "email"))
        )
        self.driver.find_element(By.ID, "email").send_keys(unique_email)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        # Chờ chuyển hướng đến trang chủ sau khi đăng nhập thành công
        WebDriverWait(self.driver, 10).until(
            lambda d: self.base_url + "/" == d.current_url or self.base_url + "/home" == d.current_url
        )
        self.assertTrue(
            self.driver.current_url == self.base_url + "/" or self.driver.current_url == self.base_url + "/home",
            "Login failed or did not redirect to home page")

    def test_product_detail(self):
        # Mở trang all products
        self.driver.get(f"{self.base_url}/products")
        # Chờ ít nhất một sản phẩm hiển thị
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )
        # Lấy liên kết chi tiết của sản phẩm đầu tiên
        first_card = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")[0]
        detail_link = first_card.find_element(By.TAG_NAME, "a").get_attribute("href")
        # Điều hướng trực tiếp đến trang chi tiết
        self.driver.get(detail_link)
        # Chờ URL chứa '/product-detail/'
        WebDriverWait(self.driver, 10).until(
            lambda d: "/product-detail/" in d.current_url
        )
        # Chờ đến khi tiêu đề chi tiết khác 'Loading...'
        heading = WebDriverWait(self.driver, 10).until(
            lambda d: d.find_element(By.TAG_NAME, 'h1') and d.find_element(By.TAG_NAME, 'h1').text != 'Loading...'
        )
        heading_text = self.driver.find_element(By.TAG_NAME, 'h1').text
        # Xác nhận tiêu đề chi tiết đã tải
        self.assertTrue(heading_text and heading_text != 'Loading...',
                        f"Product detail did not load correctly, heading: {heading_text}")

    def test_checkout_page_loads(self):
        # Mở trang checkout và xác nhận form Contact & Shipping
        self.driver.get(f"{self.base_url}/checkout")
        # Chờ tiêu đề Contact & Shipping
        heading = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(), 'Contact & Shipping')]"))
        )
        self.assertIn("Contact & Shipping", heading.text)
        # Xác nhận trường email hiển thị
        email_input = self.driver.find_element(By.ID, "email")
        self.assertTrue(email_input.is_displayed(), "Email input not displayed on checkout page")

    def test_empty_cart_shows_message(self):
        # Mở trang giỏ hàng và xác nhận thông điệp giỏ hàng trống
        self.driver.get(f"{self.base_url}/cart")
        # Chờ tiêu đề giỏ hàng
        heading = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.TAG_NAME, "h1"))
        )
        self.assertIn("Your Shopping Cart", heading.text)
        # Xác nhận thông điệp 'Your cart is empty.' hiển thị
        empty_msg = self.driver.find_element(By.XPATH, "//div[contains(text(), 'Your cart is empty.')]")
        self.assertTrue(empty_msg.is_displayed(), "Empty cart message not displayed on cart page")

    def test_featured_product_redirects_to_detail(self):
        # Mở trang home và nhấp vào sản phẩm nổi bật đầu tiên
        self.driver.get(self.base_url)
        # Chờ ít nhất một sản phẩm nổi bật hiển thị
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )
        # Lấy thẻ sản phẩm đầu tiên và click vào link chi tiết
        first_card = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")[0]
        first_card.find_element(By.TAG_NAME, "a").click()
        # Chờ chuyển hướng đến trang chi tiết
        WebDriverWait(self.driver, 10).until(
            lambda d: "/product-detail" in d.current_url
        )
        self.assertIn("/product-detail", self.driver.current_url)

    def test_breadcrumb_home_navigates_home(self):
        # Mở trang giỏ hàng và nhấp vào liên kết Home trong breadcrumb
        self.driver.get(f"{self.base_url}/cart")
        # Chờ liên kết Home hiển thị
        home_link = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.LINK_TEXT, 'Home'))
        )
        home_link.click()
        # Chờ chuyển hướng về trang chủ (có thể là / hoặc /home)
        WebDriverWait(self.driver, 10).until(
            lambda d: d.current_url == self.base_url + "/" or d.current_url == self.base_url + "/home"
        )
        # Xác nhận tiêu đề trang chủ hiển thị đúng
        heading = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.TAG_NAME, 'h1'))
        )
        self.assertRegex(heading.text, r"Find Your\s+Perfect Backpack")

    def test_end_to_end_flow(self):
        import time
        # 1. Trang chủ, ghi nhớ sản phẩm đầu tiên để thêm vào giỏ
        self.driver.get(self.base_url)
        time.sleep(2)  # Wait for page to fully load

        # Wait for product cards to load and get first product info
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )
        first_card = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")[0]
        product_name = first_card.find_element(By.CSS_SELECTOR, "a.text-lg").text
        first_card.find_element(By.XPATH, ".//button[contains(text(), 'Add to Cart')]").click()
        time.sleep(1)

        # Should redirect to login
        WebDriverWait(self.driver, 10).until(
            lambda d: "/login" in d.current_url
        )
        time.sleep(1)

        # 2. Đăng ký và đăng nhập
        WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/signup'], button[routerLink='/signup']"))
        ).click()
        time.sleep(1)

        # Fill signup form
        ts = int(time.time())
        email = f"e2e{ts}@example.com"
        password = "Pass123!"
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "name"))
        )
        self.driver.find_element(By.ID, "name").send_keys("E2E User")
        self.driver.find_element(By.ID, "email").send_keys(email)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.ID, "confirmPassword").send_keys(password)
        time.sleep(1)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        # Wait for redirect to login
        WebDriverWait(self.driver, 10).until(
            lambda d: "/login" in d.current_url
        )
        time.sleep(1)

        # Login with new account
        self.driver.find_element(By.ID, "email").send_keys(email)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        # Wait for redirect back to home and products to load
        WebDriverWait(self.driver, 10).until(
            lambda d: d.current_url == self.base_url + "/" or d.current_url == self.base_url + "/home"
        )
        time.sleep(2)  # Wait for page to fully load

        # 3. Add to Cart sau khi đăng nhập (vẫn đang ở trang home)
        # Wait for product cards and click Add to Cart again
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )

        # Tìm lại đúng sản phẩm đã chọn trước đó
        product_cards = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")
        first_card = next(card for card in product_cards
                          if card.find_element(By.CSS_SELECTOR, "a.text-lg").text == product_name)
        add_to_cart_button = first_card.find_element(By.XPATH, ".//button[contains(text(), 'Add to Cart')]")

        # Scroll to button and click
        self.driver.execute_script("arguments[0].scrollIntoView(true);", add_to_cart_button)
        time.sleep(1)
        add_to_cart_button.click()
        time.sleep(2)  # Wait for add to cart animation

        # Go to cart page
        cart_icon = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.ID, "cart-icon"))
        )
        cart_icon.click()
        time.sleep(2)

        # Verify cart is not empty
        empty_msgs = self.driver.find_elements(By.XPATH, "//div[contains(text(), 'Your cart is empty.')]")
        self.assertEqual(len(empty_msgs), 0, "Cart should not display empty-cart message after adding product")

        # 4. Click Chi tiết sản phẩm
        self.driver.get(self.base_url)
        time.sleep(1)
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )
        first_card = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")[0]
        first_card.find_element(By.TAG_NAME, "a").click()
        time.sleep(1)
        WebDriverWait(self.driver, 10).until(
            lambda d: "/product-detail" in d.current_url
        )
        time.sleep(1)

        # 5. Click Buy Now -> checkout
        self.driver.get(self.base_url)
        time.sleep(1)
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )
        first_card = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")[0]
        buy_now_button = first_card.find_element(By.XPATH, ".//button[contains(text(), 'Buy Now')]")
        buy_now_button.click()
        time.sleep(1)
        WebDriverWait(self.driver, 10).until(
            lambda d: "/checkout" in d.current_url
        )
        time.sleep(1)

        # 6. Payment Success
        self.driver.get(f"{self.base_url}/payment-success")
        time.sleep(1)
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h1[contains(text(), 'Payment Successful')]"))
        )
        time.sleep(1)
        # Continue Shopping
        self.driver.find_element(By.CSS_SELECTOR, "button[routerLink='/']").click()
        time.sleep(1)
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.TAG_NAME, "h1"))
        )
        self.assertRegex(self.driver.find_element(By.TAG_NAME, "h1").text,
                         r"Find Your\s+Perfect Backpack")


class FullSiteFlowTest(unittest.TestCase):
    """Combined end-to-end flows covering add-to-cart, buy-now, and view-all/filter/detail"""

    def setUp(self):
        # reuse HomePageTest setup
        self.home = HomePageTest()
        self.home.setUp()
        self.driver = self.home.driver
        self.base_url = self.home.base_url
        self.email = "test134@gmail.com"
        self.password = "test134"

    def tearDown(self):
        self.home.tearDown()

    def login_or_register(self):
        try:
            WebDriverWait(self.driver, 5).until(
                EC.visibility_of_element_located((By.ID, "email"))
            )
            self.driver.find_element(By.ID, "email").send_keys(self.email)
            self.driver.find_element(By.ID, "password").send_keys(self.password)
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            WebDriverWait(self.driver, 10).until(
                lambda d: "/login" not in d.current_url and self.base_url in d.current_url)
        except Exception:
            self.driver.get(f"{self.base_url}/signup")
            WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.ID, "name"))
            )
            self.driver.find_element(By.ID, "name").send_keys("Auto Test")
            self.driver.find_element(By.ID, "email").send_keys(self.email)
            self.driver.find_element(By.ID, "password").send_keys(self.password)
            self.driver.find_element(By.ID, "confirmPassword").send_keys(self.password)
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            WebDriverWait(self.driver, 10).until(lambda d: "/login" in d.current_url)
            self.driver.find_element(By.ID, "email").send_keys(self.email)
            self.driver.find_element(By.ID, "password").send_keys(self.password)
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            WebDriverWait(self.driver, 10).until(
                lambda d: "/login" not in d.current_url and self.base_url in d.current_url)

        # Ensure we are on a page that should show products (e.g. home) and they are loaded
        if not (self.driver.current_url == self.base_url + "/" or self.driver.current_url == self.base_url + "/home"):
            self.driver.get(self.base_url + "/")

        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )
        time.sleep(1)  # Pause for client-side state to settle

    def test_add_to_cart_and_buy_now(self):
        # Part 1: Home: Add to Cart -> login/register -> cart shows item
        self.driver.get(self.base_url)
        time.sleep(2)  # Wait for home page to load
        WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".product-card:first-child button:nth-child(1)"))
            # First "Add to Cart"
        ).click()
        WebDriverWait(self.driver, 10).until(lambda d: "/login" in d.current_url)
        time.sleep(1)  # Pause after redirect to login

        self.login_or_register()  # This method now ensures we are logged in and on home page with products loaded
        time.sleep(1)  # Pause after login and navigation

        # At this point, we should be on the home page and logged in.
        # Attempt to add to cart again.
        add_to_cart_button_after_login = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".product-card:first-child button:nth-child(1)"))
            # Target first Add to Cart button of first product
        )
        self.driver.execute_script("arguments[0].scrollIntoView(true);", add_to_cart_button_after_login)
        time.sleep(0.5)  # Short pause after scroll
        # Use JavaScript click for the second add to cart
        self.driver.execute_script("arguments[0].click();", add_to_cart_button_after_login)

        time.sleep(5)  # Wait for add-to-cart to complete
        # Navigate to cart via SPA click to preserve in-memory cart state
        WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.ID, "cart-icon"))
        ).click()
        WebDriverWait(self.driver, 10).until(
            lambda d: "/cart" in d.current_url
        )
        # Confirm cart is not empty by ensuring 'Your cart is empty.' message is absent
        empty_msgs = self.driver.find_elements(By.XPATH, "//div[contains(text(), 'Your cart is empty.')]")
        self.assertEqual(len(empty_msgs), 0, "Cart should not display empty-cart message after adding product")
        time.sleep(1)

        # Part 2: Buy Now flow tests similar to HomePageTest
        self.driver.get(self.base_url)
        time.sleep(1)
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )
        first_card = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")[0]
        buy_now_button = first_card.find_element(By.XPATH, ".//button[contains(text(), 'Buy Now')]")
        buy_now_button.click()
        time.sleep(1)
        WebDriverWait(self.driver, 10).until(
            lambda d: "/checkout" in d.current_url
        )
        time.sleep(1)
        # Payment Success simulation
        self.driver.get(f"{self.base_url}/payment-success")
        time.sleep(1)
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//h1[contains(text(), 'Payment Successful')]"))
        )
        time.sleep(1)


# selenium_test.py entrypoint
if __name__ == "__main__":
    import unittest
    import sys
    import os
    from datetime import datetime

    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])

    # Set up CSV result output
    csv_file_path = os.path.join(os.path.dirname(__file__), 'test_results.csv')
    with open(csv_file_path, 'w') as f:
        from csv import writer

        csv_writer = writer(f)
        csv_writer.writerow(['Timestamp', 'Test ID', 'Result', 'Details'])  # CSV header

        # Create test runner with CSV result handler
        runner = unittest.TextTestRunner(resultclass=CSVTestResult)
        runner.resultclass.csv_writer = csv_writer  # Pass CSV writer to result class

        # Add timestamp to results
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Run tests and store results
        result = runner.run(suite)

        # Get list of all test cases and their results
        successes = [test.id() for test in result.successes] if hasattr(result, 'successes') else []
        failures = [failure[0].id() for failure in result.failures]
        errors = [error[0].id() for error in result.errors]

        # Write detailed summary of all test cases
        csv_writer.writerow([])  # Empty row for readability
        csv_writer.writerow([current_time, '=== DETAILED SUMMARY ===', '', ''])

        # Write successful tests
        if successes:
            csv_writer.writerow([current_time, 'PASSED TESTS', f'Total: {len(successes)}', ''])
            for test_id in successes:
                csv_writer.writerow([current_time, test_id, 'SUCCESS', ''])

        # Write failed tests
        if failures:
            csv_writer.writerow([current_time, 'FAILED TESTS', f'Total: {len(failures)}', ''])
            for test_id in failures:
                csv_writer.writerow([current_time, test_id, 'FAILURE', 'Check detailed error above'])

        # Write error tests
        if errors:
            csv_writer.writerow([current_time, 'ERROR TESTS', f'Total: {len(errors)}', ''])
            for test_id in errors:
                csv_writer.writerow([current_time, test_id, 'ERROR', 'Check detailed error above'])

        # Write final summary
        csv_writer.writerow([])  # Empty row for readability
        csv_writer.writerow([
            current_time,
            'FINAL SUMMARY',
            f'Total: {result.testsRun}, Passed: {len(successes)}, Failed: {len(failures)}, Errors: {len(errors)}',
            ''
        ])

    print(f"\nTest results have been saved to: {csv_file_path}")

    # Exit with error code if tests failed
    sys.exit(not result.wasSuccessful())
