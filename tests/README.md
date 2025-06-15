# Hướng Dẫn Kiểm Thử Selenium

Thư mục này chứa các bài kiểm thử tự động sử dụng Selenium WebDriver để kiểm tra chức năng giao diện người dùng của ứng dụng web.

## Yêu Cầu Hệ Thống

Trước khi chạy kiểm thử, hãy đảm bảo bạn đã cài đặt các thành phần sau:

- Python 3.x
- pip (Trình quản lý gói Python)
- Trình duyệt Google Chrome

## Cài Đặt

1. Cài đặt các gói Python cần thiết bằng lệnh:
   ```bash
   pip install -r requirements.txt
   ```

Lệnh trên sẽ cài đặt:
- Selenium WebDriver (phiên bản 4.0.0 trở lên)
- WebDriver Manager (phiên bản 3.0.0 trở lên)

## Cấu Trúc Kiểm Thử

Bộ kiểm thử bao gồm:
- `selenium_test.py`: Tệp kiểm thử chính chứa tất cả các ca kiểm thử
- `test_results.csv`: Tệp CSV lưu trữ kết quả thực thi kiểm thử

## Chạy Kiểm Thử

Để chạy kiểm thử, thực thi lệnh sau từ thư mục `tests`:

```bash
python selenium_test.py
```

### Ghi Chú Về Thực Thi Kiểm Thử

- Kiểm thử chạy ở chế độ headless mặc định (không có giao diện trình duyệt)
- Kết quả kiểm thử tự động được lưu vào `test_results.csv`
- Mỗi kết quả kiểm thử bao gồm:
  - Thời gian
  - ID kiểm thử
  - Trạng thái (THÀNH CÔNG/THẤT BẠI/LỖI)
  - Thông báo lỗi (nếu có)

## Các Ca Kiểm Thử

Bộ kiểm thử bao gồm nhiều ca kiểm thử cho các chức năng khác nhau:
- Kiểm thử trang chủ
- Kiểm thử điều hướng
- Kiểm thử tương tác người dùng
- Kiểm thử gửi biểu mẫu
- Kiểm thử luồng xác thực

## Kết Quả Kiểm Thử

Kết quả kiểm thử được lưu trong `test_results.csv` với định dạng:
```csv
Thời gian, ID Kiểm thử, Trạng thái, Thông báo lỗi
```

## Xử Lý Sự Cố

Nếu gặp vấn đề:

1. Đảm bảo đã cài đặt đầy đủ các yêu cầu hệ thống
2. Kiểm tra trình duyệt Chrome đã được cập nhật
3. Xác minh ứng dụng web đang chạy và có thể truy cập
4. Kiểm tra đầu ra console và test_results.csv để xem thông báo lỗi cụ thể

## Đóng Góp

Khi thêm kiểm thử mới:
1. Thêm ca kiểm thử vào lớp kiểm thử phù hợp trong `selenium_test.py`
2. Tuân theo mẫu có sẵn cho các phương thức kiểm thử
3. Bao gồm các assertion và xử lý lỗi phù hợp
4. Cập nhật README này nếu thêm danh mục kiểm thử mới hoặc yêu cầu mới

## Lưu Ý

- Kiểm thử chạy ở chế độ headless để tương thích với CI/CD
- WebDriver được tự động quản lý bằng webdriver-manager
- Kết quả kiểm thử được ghi lại để theo dõi và phân tích
