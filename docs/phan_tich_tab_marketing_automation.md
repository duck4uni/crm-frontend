# PHÂN TÍCH TAB MARKETING AUTOMATION

> Tài liệu phân tích riêng tab **Marketing Automation** dựa trên các hình ảnh đã cung cấp.  
> Phạm vi chỉ tập trung vào: danh sách automation, tạo automation từ mẫu, workflow builder, điều kiện bắt đầu, cấu hình điều kiện, cấu hình SMS, thông tin automation, logs và trạng thái automation.

---

## 1. Tổng quan chức năng

Tab **Marketing Automation** dùng để tạo, quản lý và vận hành các kịch bản tự động hóa trong CRM.

Mục tiêu chính:

```text
Khi một sự kiện xảy ra trong CRM
→ Hệ thống kiểm tra điều kiện
→ Nếu thỏa điều kiện
→ Thực hiện hành động tự động
→ Ghi nhận log kết quả
```

Ví dụ từ hình ảnh:

```text
Tạo mới công việc
→ Kiểm tra loại công việc
→ Trước giờ bắt đầu 2 giờ gửi SMS nhắc nhân viên
→ Trước giờ bắt đầu 1 giờ gửi SMS nhắc khách hàng
```

---

## 2. Cấu trúc chức năng tổng quan

```text
Marketing Automation
├── 1. Danh sách automation
├── 2. Tạo automation từ mẫu
├── 3. Workflow builder
│   ├── Canvas thiết kế workflow
│   ├── Node điều kiện bắt đầu
│   ├── Node hành động
│   ├── Kết nối node
│   ├── Mini map
│   └── Zoom canvas
├── 4. Điều kiện bắt đầu
│   ├── Theo hành động
│   └── Theo thời gian
├── 5. Cấu hình điều kiện chi tiết
│   ├── Trường điều kiện
│   ├── Toán tử
│   ├── Giá trị
│   └── Thời gian trước/sau sự kiện
├── 6. Hành động gửi SMS
│   ├── Tên thương hiệu
│   ├── Người nhận
│   ├── Mã chiến dịch
│   ├── Nội dung SMS
│   ├── Biến động
│   └── Tùy chọn gửi SMS có dấu
├── 7. Thông tin automation
│   ├── Mô tả
│   └── Nhóm automation
├── 8. Logs automation
└── 9. Quản lý trạng thái automation
    ├── Lưu nháp
    ├── Hoạt động
    └── Cập nhật
```

---

# MKT-AUTO-01. Danh sách Automation

## 1.1. Mục đích

Màn hình danh sách automation dùng để quản lý toàn bộ automation đã được tạo trong hệ thống.

Người dùng có thể:

- Xem danh sách automation.
- Tìm kiếm automation theo tên.
- Lọc automation theo nhóm, người tạo, ngày tạo, trạng thái.
- Xem trạng thái kích hoạt.
- Tạo automation mới.

## 1.2. Thành phần giao diện

| Thành phần | Mô tả |
|---|---|
| Ô tìm kiếm tên automation | Cho phép tìm automation theo tên |
| Bộ lọc nhóm automation | Lọc automation theo nhóm |
| Bộ lọc người tạo | Lọc automation theo người tạo |
| Bộ lọc ngày tạo | Lọc automation theo ngày tạo |
| Bộ lọc trạng thái | Lọc tất cả, đã kích hoạt hoặc chưa kích hoạt |
| Nút Thêm mới | Mở panel chọn mẫu automation |
| Bảng danh sách automation | Hiển thị danh sách automation hiện có |

## 1.3. Cột dữ liệu trong bảng

| Cột | Mô tả |
|---|---|
| # | Số thứ tự |
| Tên automation | Tên automation, có thể kèm mô tả ngắn |
| Ngày tạo | Ngày automation được tạo |
| Người tạo | Người tạo automation |
| Nhóm automation | Nhóm phân loại automation |
| Trạng thái | Đã kích hoạt hoặc chưa kích hoạt |

## 1.4. Chức năng con

| Mã chức năng | Tên chức năng | Mô tả |
|---|---|---|
| MKT-AUTO-01-01 | Xem danh sách automation | Hiển thị toàn bộ automation trong hệ thống |
| MKT-AUTO-01-02 | Tìm kiếm theo tên automation | Tìm automation theo từ khóa tên |
| MKT-AUTO-01-03 | Lọc theo nhóm automation | Lọc automation theo nhóm đã phân loại |
| MKT-AUTO-01-04 | Lọc theo người tạo | Hiển thị automation theo người tạo |
| MKT-AUTO-01-05 | Lọc theo ngày tạo | Lọc automation theo ngày tạo |
| MKT-AUTO-01-06 | Lọc theo trạng thái | Lọc automation theo trạng thái hoạt động |
| MKT-AUTO-01-07 | Xem trạng thái automation | Hiển thị automation đã kích hoạt/chưa kích hoạt |
| MKT-AUTO-01-08 | Mở chi tiết automation | Chọn một automation để xem/cập nhật |
| MKT-AUTO-01-09 | Tạo mới automation | Bấm nút Thêm mới để tạo automation |

## 1.5. Trạng thái hiện có

| Trạng thái | Ý nghĩa |
|---|---|
| Đã kích hoạt | Automation đang hoạt động và có thể tự động chạy |
| Chưa kích hoạt | Automation chưa được bật chạy |

## 1.6. Đề xuất trạng thái bổ sung

```text
Bản nháp
Đã kích hoạt
Tạm dừng
Lỗi cấu hình
Đã lưu trữ
```

---

# MKT-AUTO-02. Tạo Automation từ mẫu

## 2.1. Mục đích

Khi người dùng bấm **Thêm mới**, hệ thống mở panel bên phải để chọn mẫu automation có sẵn hoặc tạo automation từ đầu.

## 2.2. Nhóm mẫu automation

| Nhóm mẫu | Mô tả |
|---|---|
| Tất cả | Hiển thị toàn bộ mẫu automation |
| Công việc nội bộ | Các automation liên quan đến task, nhắc việc, giao việc |
| Sau bán | Các automation chăm sóc sau bán hàng |
| Trong bán | Các automation hỗ trợ quá trình bán hàng |
| Trước bán | Các automation thu lead, nuôi dưỡng khách hàng trước bán |

## 2.3. Mẫu automation nhìn thấy trong hình

| Mẫu automation | Mục đích |
|---|---|
| Phát triển từ đầu | Tạo workflow trắng |
| Mẫu auto gửi SMS nhắc lịch hẹn cho khách hàng và nhân viên | Gửi SMS nhắc lịch hẹn |
| Mẫu auto gửi SMS chúc mừng sinh nhật khách hàng và nhân viên | Tự động chúc mừng sinh nhật |
| Mẫu auto gửi thông báo nhắc công việc cho nhân viên trước giờ bắt đầu | Nhắc công việc nội bộ |
| Mẫu auto tự động chuyển mối quan hệ khách hàng sau trạng thái chốt | Cập nhật quan hệ khách hàng sau khi chốt |
| Mẫu auto tự động tạo công việc nhắc nhân viên gọi khách hàng 30 ngày | Nhắc nhân viên chăm sóc lại khách |
| Mẫu auto tự động thu hồi khách hàng sales không chăm sóc sau 7 ngày | Thu hồi khách hàng/lead không được chăm sóc |
| Mẫu auto gửi SMS thông tin khách hàng đã thanh toán | Gửi SMS sau khi khách thanh toán |
| Mẫu auto giao việc cho bộ phận liên quan | Giao việc tự động cho bộ phận xử lý |

## 2.4. Chức năng con

| Mã chức năng | Tên chức năng | Mô tả |
|---|---|---|
| MKT-AUTO-02-01 | Mở panel mẫu automation | Hiển thị danh sách mẫu automation |
| MKT-AUTO-02-02 | Tìm kiếm mẫu automation | Tìm mẫu theo tên |
| MKT-AUTO-02-03 | Lọc mẫu theo nhóm | Lọc mẫu theo Công việc nội bộ, Sau bán, Trong bán, Trước bán |
| MKT-AUTO-02-04 | Xem mô tả mẫu | Xem mục đích sử dụng của mẫu |
| MKT-AUTO-02-05 | Chọn mẫu automation | Chọn một mẫu để tạo automation |
| MKT-AUTO-02-06 | Tạo automation từ đầu | Tạo workflow trắng |
| MKT-AUTO-02-07 | Tạo automation từ template | Tạo workflow dựa trên mẫu có sẵn |
| MKT-AUTO-02-08 | Tự sinh workflow theo mẫu | Hệ thống sinh các node theo mẫu đã chọn |

## 2.5. Luồng tạo automation từ mẫu

```text
Người dùng vào Marketing Automation
→ Bấm Thêm mới
→ Hệ thống mở panel mẫu automation
→ Người dùng chọn nhóm mẫu
→ Người dùng chọn template
→ Hệ thống tạo workflow theo template
→ Người dùng chỉnh sửa điều kiện/hành động
→ Lưu nháp hoặc kích hoạt automation
```

---

# MKT-AUTO-03. Workflow Builder

## 3.1. Mục đích

Workflow Builder là màn hình dùng để thiết kế luồng automation bằng các node kéo thả.

## 3.2. Cấu trúc màn hình

| Khu vực | Mô tả |
|---|---|
| Thanh trên | Hiển thị breadcrumb, tên automation, nút Lưu nháp, nút Hoạt động |
| Sidebar trái | Danh sách điều kiện ban đầu và nhóm hành động |
| Canvas giữa | Khu vực thiết kế workflow |
| Panel phải | Cấu hình chi tiết node đang được chọn |
| Mini map | Hiển thị tổng quan workflow |
| Zoom control | Phóng to, thu nhỏ canvas |

## 3.3. Các tab trong màn hình chi tiết automation

| Tab | Mô tả |
|---|---|
| Workflow | Thiết kế luồng automation |
| Thông tin | Nhập mô tả và nhóm automation |
| Logs | Xem lịch sử automation đã chạy |

## 3.4. Các node xuất hiện trong hình

| Node | Loại | Ý nghĩa |
|---|---|---|
| Tạo mới công việc | Trigger/điều kiện bắt đầu | Automation chạy khi có công việc mới |
| Gửi SMS nhắc lịch hẹn với nhân viên trước 2h | Action | Gửi SMS cho nhân viên trước giờ hẹn 2 giờ |
| Gửi SMS nhắc lịch hẹn với khách hàng trước 1h | Action | Gửi SMS cho khách hàng trước giờ hẹn 1 giờ |
| KH đọc email | Trigger/hành vi khách hàng | Automation chạy khi khách hàng đọc email |

## 3.5. Chức năng con

| Mã chức năng | Tên chức năng | Mô tả |
|---|---|---|
| MKT-AUTO-03-01 | Hiển thị canvas workflow | Hiển thị vùng thiết kế automation |
| MKT-AUTO-03-02 | Thêm node trigger | Thêm điều kiện bắt đầu vào canvas |
| MKT-AUTO-03-03 | Thêm node hành động | Thêm hành động vào canvas |
| MKT-AUTO-03-04 | Kéo thả node | Di chuyển node trên canvas |
| MKT-AUTO-03-05 | Kết nối node | Nối các node để tạo flow |
| MKT-AUTO-03-06 | Xóa node | Xóa node khỏi workflow |
| MKT-AUTO-03-07 | Chọn node để cấu hình | Click node để mở panel cấu hình |
| MKT-AUTO-03-08 | Zoom in canvas | Phóng to canvas |
| MKT-AUTO-03-09 | Zoom out canvas | Thu nhỏ canvas |
| MKT-AUTO-03-10 | Xem mini map | Xem vị trí tổng quan của workflow |
| MKT-AUTO-03-11 | Lưu nháp workflow | Lưu workflow nhưng chưa kích hoạt |
| MKT-AUTO-03-12 | Kích hoạt workflow | Bật automation hoạt động |

## 3.6. Nhận xét

Workflow Builder là phần quan trọng nhất của tab Marketing Automation. Màn hình này cho phép người dùng tự thiết kế kịch bản tự động mà không cần can thiệp code.

Cần đảm bảo:

```text
Node phải có đủ cấu hình trước khi kích hoạt.
Node gửi SMS phải có người nhận, nội dung, brandname.
Node điều kiện phải có trigger rõ ràng.
Workflow phải có đường nối hợp lệ.
Automation khi bật hoạt động không được chạy trùng hoặc chạy sai.
```

---

# MKT-AUTO-04. Điều kiện bắt đầu

## 4.1. Mục đích

Điều kiện bắt đầu là sự kiện kích hoạt automation. Khi sự kiện này xảy ra, hệ thống sẽ kiểm tra điều kiện và chạy workflow nếu hợp lệ.

## 4.2. Hai nhóm điều kiện

| Nhóm | Mô tả |
|---|---|
| Theo hành động | Automation chạy khi phát sinh một hành động/sự kiện trong CRM |
| Theo thời gian | Automation chạy theo thời gian được cấu hình |

## 4.3. Danh sách điều kiện theo hành động trong hình

| Điều kiện | Ý nghĩa |
|---|---|
| Gửi email cho khách hàng | Khi hệ thống gửi email cho khách hàng |
| KH đọc email | Khi khách hàng mở email |
| Người đọc click link trong email | Khi người nhận click link trong email |
| KH lần đầu vào CRM | Khi khách hàng lần đầu được thêm vào CRM |
| Chỉnh sửa thông tin KH | Khi thông tin khách hàng bị chỉnh sửa |
| Thay đổi mối quan hệ | Khi trạng thái/mối quan hệ khách hàng thay đổi |
| Giới thiệu khách hàng | Khi có hoạt động giới thiệu khách hàng |
| Thay đổi điểm, tiền thưởng | Khi điểm hoặc tiền thưởng thay đổi |
| Tạo mới công việc | Khi công việc mới được tạo |
| Hoàn thành công việc | Khi công việc hoàn thành |
| Hủy công việc | Khi công việc bị hủy |
| KH được đưa vào một chiến dịch | Khi khách hàng được thêm vào chiến dịch |
| Chỉnh sửa thông tin cơ hội | Khi cơ hội được cập nhật |
| Cơ hội thành công | Khi cơ hội chuyển sang thành công |
| Cơ hội thất bại | Khi cơ hội chuyển sang thất bại |
| Tạo mới đơn hàng | Khi đơn hàng mới được tạo |

## 4.4. Chức năng con

| Mã chức năng | Tên chức năng | Mô tả |
|---|---|---|
| MKT-AUTO-04-01 | Chọn trigger theo hành động | Chọn sự kiện bắt đầu theo hành động |
| MKT-AUTO-04-02 | Chọn trigger theo thời gian | Chọn sự kiện bắt đầu theo thời gian |
| MKT-AUTO-04-03 | Trigger gửi email | Chạy khi gửi email cho khách hàng |
| MKT-AUTO-04-04 | Trigger KH đọc email | Chạy khi khách mở email |
| MKT-AUTO-04-05 | Trigger click link email | Chạy khi khách click link |
| MKT-AUTO-04-06 | Trigger KH lần đầu vào CRM | Chạy khi khách được thêm vào CRM |
| MKT-AUTO-04-07 | Trigger chỉnh sửa thông tin KH | Chạy khi thông tin khách hàng thay đổi |
| MKT-AUTO-04-08 | Trigger thay đổi mối quan hệ | Chạy khi quan hệ khách hàng thay đổi |
| MKT-AUTO-04-09 | Trigger thay đổi điểm/thưởng | Chạy khi điểm hoặc tiền thưởng thay đổi |
| MKT-AUTO-04-10 | Trigger tạo mới công việc | Chạy khi có công việc mới |
| MKT-AUTO-04-11 | Trigger hoàn thành công việc | Chạy khi task hoàn thành |
| MKT-AUTO-04-12 | Trigger hủy công việc | Chạy khi task bị hủy |
| MKT-AUTO-04-13 | Trigger KH vào chiến dịch | Chạy khi khách được đưa vào campaign |
| MKT-AUTO-04-14 | Trigger chỉnh sửa cơ hội | Chạy khi opportunity được cập nhật |
| MKT-AUTO-04-15 | Trigger cơ hội thành công | Chạy khi opportunity thành công |
| MKT-AUTO-04-16 | Trigger cơ hội thất bại | Chạy khi opportunity thất bại |
| MKT-AUTO-04-17 | Trigger tạo mới đơn hàng | Chạy khi có đơn hàng mới |

---

# MKT-AUTO-05. Cấu hình điều kiện chi tiết

## 5.1. Mục đích

Cấu hình điều kiện chi tiết giúp automation chỉ chạy đúng với các đối tượng phù hợp.

Ví dụ trong hình:

```text
Trigger: Tạo mới công việc
Điều kiện: Loại CV nằm trong Họp nội bộ
Thời gian: Trước khi bắt đầu công việc 2 giờ 0 phút
```

## 5.2. Thành phần cấu hình

| Thành phần | Mô tả |
|---|---|
| Trường điều kiện | Trường dữ liệu dùng để kiểm tra, ví dụ Loại CV |
| Toán tử | Cách so sánh, ví dụ Trong số |
| Giá trị | Giá trị cần kiểm tra, ví dụ Họp nội bộ |
| Thêm điều kiện | Thêm nhiều điều kiện |
| Tính thời gian theo công việc | Bật/tắt việc tính thời gian theo công việc |
| Trước/Sau | Chọn thời điểm chạy trước hoặc sau mốc tham chiếu |
| Mốc tham chiếu | Ví dụ Khi bắt đầu công việc |
| Giờ/Phút | Khoảng thời gian lệch so với mốc tham chiếu |

## 5.3. Chức năng con

| Mã chức năng | Tên chức năng | Mô tả |
|---|---|---|
| MKT-AUTO-05-01 | Chọn trường dữ liệu điều kiện | Chọn trường để kiểm tra |
| MKT-AUTO-05-02 | Chọn toán tử điều kiện | Chọn cách so sánh dữ liệu |
| MKT-AUTO-05-03 | Chọn giá trị điều kiện | Chọn giá trị điều kiện |
| MKT-AUTO-05-04 | Thêm điều kiện | Thêm dòng điều kiện mới |
| MKT-AUTO-05-05 | Xóa điều kiện | Xóa điều kiện đã thêm |
| MKT-AUTO-05-06 | Cấu hình điều kiện theo loại công việc | Ví dụ loại CV nằm trong Họp nội bộ |
| MKT-AUTO-05-07 | Bật/tắt tính thời gian theo công việc | Dùng thời gian của task để schedule action |
| MKT-AUTO-05-08 | Chọn trước/sau mốc thời gian | Chạy trước hoặc sau mốc tham chiếu |
| MKT-AUTO-05-09 | Chọn mốc thời gian tham chiếu | Ví dụ khi bắt đầu công việc |
| MKT-AUTO-05-10 | Nhập số giờ | Nhập thời gian lệch theo giờ |
| MKT-AUTO-05-11 | Nhập số phút | Nhập thời gian lệch theo phút |
| MKT-AUTO-05-12 | Cập nhật cấu hình điều kiện | Lưu cấu hình điều kiện |

## 5.4. Toán tử đề xuất bổ sung

```text
Bằng
Khác
Trong số
Không nằm trong số
Chứa
Không chứa
Lớn hơn
Nhỏ hơn
Có dữ liệu
Không có dữ liệu
```

## 5.5. Điểm cần làm rõ

| Vấn đề | Cần làm rõ |
|---|---|
| Nhiều điều kiện | Các điều kiện đang dùng AND hay OR |
| Điều kiện thời gian | Nếu công việc đổi lịch thì có cập nhật lịch gửi SMS không |
| Công việc bị hủy | Nếu task bị hủy thì SMS đã lên lịch có bị hủy không |
| Điều kiện thiếu dữ liệu | Nếu thiếu trường dữ liệu thì bỏ qua hay báo lỗi |

---

# MKT-AUTO-06. Hành động gửi SMS

## 6.1. Mục đích

Node gửi SMS dùng để hệ thống tự động gửi tin nhắn đến khách hàng, nhân viên hoặc đối tượng liên quan khi workflow chạy.

## 6.2. Form cấu hình gửi SMS trong hình

| Trường | Mô tả |
|---|---|
| Tên thương hiệu | Brandname SMS dùng để gửi tin |
| Người nhận | Đối tượng nhận SMS |
| Mã chiến dịch | Chiến dịch SMS liên quan |
| Nội dung | Nội dung tin nhắn SMS |
| Sử dụng mẫu SMS | Dùng template SMS có sẵn |
| Gửi SMS có dấu | Bật/tắt tiếng Việt có dấu |
| Bộ đếm ký tự | Hiển thị ký tự còn lại và số SMS |

## 6.3. Nội dung SMS có biến động

Mẫu SMS trong hình:

```text
Bạn có lịch hẹn với {{at.contact_name}} - {{at.a_name}} {{at.contact_phone}} vào lúc {{at.start_date}}. Chúc thành công!
```

## 6.4. Biến động dự kiến

| Biến | Ý nghĩa dự kiến |
|---|---|
| `{{at.contact_name}}` | Tên khách hàng hoặc người liên hệ |
| `{{at.a_name}}` | Tên nhân viên hoặc người phụ trách |
| `{{at.contact_phone}}` | Số điện thoại khách hàng |
| `{{at.start_date}}` | Thời gian bắt đầu công việc/lịch hẹn |

## 6.5. Chức năng con

| Mã chức năng | Tên chức năng | Mô tả |
|---|---|---|
| MKT-AUTO-06-01 | Chọn tên thương hiệu SMS | Chọn brandname gửi tin |
| MKT-AUTO-06-02 | Chọn người nhận SMS | Chọn khách hàng, nhân viên hoặc đối tượng liên quan |
| MKT-AUTO-06-03 | Chọn mã chiến dịch SMS | Gắn SMS với campaign |
| MKT-AUTO-06-04 | Nhập nội dung SMS | Soạn nội dung tin nhắn |
| MKT-AUTO-06-05 | Chèn biến động vào SMS | Chèn biến như tên khách, thời gian hẹn |
| MKT-AUTO-06-06 | Sử dụng mẫu SMS | Chọn mẫu SMS có sẵn |
| MKT-AUTO-06-07 | Bật/tắt gửi SMS có dấu | Chọn SMS tiếng Việt có dấu hoặc không dấu |
| MKT-AUTO-06-08 | Kiểm tra số ký tự SMS | Kiểm tra số SMS phát sinh |
| MKT-AUTO-06-09 | Cập nhật node SMS | Lưu cấu hình node gửi SMS |
| MKT-AUTO-06-10 | Ghi log kết quả gửi SMS | Lưu kết quả gửi thành công/thất bại |

## 6.6. Rủi ro cần kiểm tra

| Rủi ro | Mô tả |
|---|---|
| Thiếu số điện thoại | Người nhận không có số điện thoại nên không gửi được |
| Thiếu brandname | Không thể gửi SMS nếu chưa chọn tên thương hiệu |
| Thiếu mã chiến dịch | Khó tracking hiệu quả gửi |
| Biến không có dữ liệu | Nội dung SMS bị trống hoặc lỗi |
| Vượt ký tự SMS | Có thể phát sinh nhiều SMS, tăng chi phí |
| Gửi SMS trùng | Một người nhận nhiều tin giống nhau |
| Gửi sai người nhận | Nhầm khách hàng, nhân viên hoặc người phụ trách |

---

# MKT-AUTO-07. Thông tin Automation

## 7.1. Mục đích

Tab **Thông tin** dùng để nhập mô tả automation và phân loại automation vào nhóm.

## 7.2. Các trường trong hình

| Trường | Mô tả |
|---|---|
| Mô tả | Nội dung mô tả mục đích và lưu ý khi sử dụng automation |
| Nhóm automation | Nhóm phân loại automation |
| Thêm mới nhóm automation | Tạo nhanh nhóm automation mới |

## 7.3. Nội dung mô tả mẫu trong hình

```text
Mục đích sử dụng:
Gửi SMS nhắc lịch hẹn cho khách hàng và nhân viên.

Lưu ý khi sử dụng:
Với từng loại công việc, dự án công việc khác nhau, có thời gian nhắc lịch khác nhau thì cần tách riêng các kịch bản, và lựa chọn điều kiện con tương ứng.
```

## 7.4. Chức năng con

| Mã chức năng | Tên chức năng | Mô tả |
|---|---|---|
| MKT-AUTO-07-01 | Nhập mô tả automation | Nhập nội dung mô tả |
| MKT-AUTO-07-02 | Định dạng mô tả | In đậm, nghiêng, gạch đầu dòng hoặc định dạng nội dung |
| MKT-AUTO-07-03 | Chọn nhóm automation | Chọn nhóm phân loại |
| MKT-AUTO-07-04 | Tạo mới nhóm automation | Tạo nhóm mới ngay trong màn hình |
| MKT-AUTO-07-05 | Lưu thông tin automation | Lưu mô tả và nhóm automation |

## 7.5. Đề xuất format mô tả chuẩn

```text
1. Mục đích
2. Điều kiện kích hoạt
3. Đối tượng áp dụng
4. Hành động tự động
5. Lưu ý vận hành
6. Người phụ trách
```

---

# MKT-AUTO-08. Logs Automation

## 8.1. Mục đích

Tab **Logs** dùng để xem lịch sử automation đã chạy. Trong hình có tab Logs nhưng chưa có ảnh hiển thị dữ liệu chi tiết.

## 8.2. Dữ liệu log nên có

| Dữ liệu | Mô tả |
|---|---|
| Thời gian chạy | Automation chạy lúc nào |
| Tên automation | Automation nào được chạy |
| Trigger | Sự kiện kích hoạt automation |
| Đối tượng liên quan | Khách hàng, công việc, cơ hội hoặc đơn hàng |
| Node đã chạy | Node nào đã được thực thi |
| Trạng thái | Thành công, thất bại hoặc bỏ qua |
| Lý do lỗi | Lỗi thiếu dữ liệu, lỗi gửi SMS, lỗi điều kiện |
| Người nhận | Người nhận SMS/email/ZNS |
| Nội dung gửi | Nội dung đã gửi |
| Số lần retry | Số lần thử lại nếu lỗi |

## 8.3. Chức năng con

| Mã chức năng | Tên chức năng | Mô tả |
|---|---|---|
| MKT-AUTO-08-01 | Xem lịch sử automation chạy | Hiển thị toàn bộ lần chạy automation |
| MKT-AUTO-08-02 | Xem log theo từng node | Theo dõi node nào đã chạy |
| MKT-AUTO-08-03 | Xem log thành công | Lọc các lần chạy thành công |
| MKT-AUTO-08-04 | Xem log thất bại | Lọc các lần chạy lỗi |
| MKT-AUTO-08-05 | Xem lý do lỗi | Xem nguyên nhân lỗi chi tiết |
| MKT-AUTO-08-06 | Xem dữ liệu đầu vào | Kiểm tra dữ liệu trigger/action nhận được |
| MKT-AUTO-08-07 | Xem đối tượng bị tác động | Xem khách hàng/task/cơ hội/đơn hàng liên quan |
| MKT-AUTO-08-08 | Retry hành động lỗi | Thực hiện lại action bị lỗi |
| MKT-AUTO-08-09 | Export log | Xuất log để kiểm tra hoặc báo cáo |

---

# MKT-AUTO-09. Quản lý trạng thái Automation

## 9.1. Mục đích

Quản lý trạng thái giúp kiểm soát automation đang là bản nháp hay đang chạy thực tế.

## 9.2. Nút thao tác trong hình

| Nút | Mô tả |
|---|---|
| Lưu nháp | Lưu automation nhưng chưa cho chạy |
| Hoạt động | Kích hoạt automation |
| Cập nhật | Lưu cấu hình node hoặc thông tin automation |

## 9.3. Chức năng con

| Mã chức năng | Tên chức năng | Mô tả |
|---|---|---|
| MKT-AUTO-09-01 | Lưu nháp automation | Lưu nhưng chưa kích hoạt |
| MKT-AUTO-09-02 | Kích hoạt automation | Bật automation để hệ thống chạy tự động |
| MKT-AUTO-09-03 | Cập nhật automation | Cập nhật thay đổi trong workflow |
| MKT-AUTO-09-04 | Hiển thị trạng thái automation | Hiển thị trạng thái đã kích hoạt/chưa kích hoạt |
| MKT-AUTO-09-05 | Kiểm tra cấu hình trước khi kích hoạt | Validate workflow trước khi bật |
| MKT-AUTO-09-06 | Cảnh báo node chưa nối | Không cho kích hoạt nếu node bị rời |
| MKT-AUTO-09-07 | Cảnh báo thiếu điều kiện | Không cho kích hoạt nếu trigger thiếu cấu hình |
| MKT-AUTO-09-08 | Cảnh báo thiếu thông tin SMS | Không cho gửi nếu thiếu brandname, người nhận, nội dung |

---

# 10. Luồng nghiệp vụ chính

## 10.1. Luồng tạo automation từ template

```text
Người dùng vào Marketing Automation
→ Bấm Thêm mới
→ Panel mẫu automation mở ra
→ Chọn nhóm mẫu
→ Chọn template automation
→ Hệ thống tạo workflow theo template
→ Người dùng chỉnh điều kiện/hành động
→ Nhập hoặc sửa tên automation
→ Lưu nháp hoặc kích hoạt
```

## 10.2. Luồng gửi SMS nhắc lịch hẹn

```text
Nhân viên tạo mới công việc/lịch hẹn
→ Hệ thống kiểm tra loại công việc
→ Nếu loại công việc phù hợp
→ Trước giờ bắt đầu 2 giờ gửi SMS nhắc nhân viên
→ Trước giờ bắt đầu 1 giờ gửi SMS nhắc khách hàng
→ Ghi log gửi SMS
→ Nếu lỗi gửi SMS thì ghi log lỗi
```

## 10.3. Luồng automation theo hành vi email

```text
Gửi email cho khách hàng
→ Khách hàng đọc email
→ Hệ thống nhận sự kiện KH đọc email
→ Automation tiếp tục chạy theo workflow đã cấu hình
```

---

# 11. Dữ liệu cần có để automation chạy đúng

| Nhóm dữ liệu | Dữ liệu cần có |
|---|---|
| Automation | Tên automation, trạng thái, nhóm automation, mô tả |
| Trigger | Loại sự kiện, điều kiện bắt đầu |
| Công việc | Tên công việc, loại công việc, thời gian bắt đầu, người phụ trách |
| Khách hàng | Tên khách hàng, số điện thoại, người liên hệ |
| Nhân viên | Tên nhân viên, số điện thoại |
| SMS | Brandname, mã chiến dịch, nội dung SMS |
| Logs | Thời gian chạy, node chạy, kết quả, lỗi nếu có |

---

# 12. Điểm mạnh hiện tại

| Điểm mạnh | Nhận xét |
|---|---|
| Có workflow builder trực quan | Người dùng có thể kéo thả và nối node |
| Có template automation | Giúp tạo nhanh các kịch bản phổ biến |
| Có trigger đa dạng | Bao gồm email, khách hàng, công việc, cơ hội, đơn hàng |
| Có điều kiện theo thời gian | Phù hợp nhắc lịch trước/sau sự kiện |
| Có gửi SMS tự động | Hữu ích cho nhắc lịch và chăm sóc khách hàng |
| Có tab thông tin | Giúp mô tả mục đích automation |
| Có tab logs | Cần thiết để kiểm tra kết quả chạy |
| Có trạng thái kích hoạt | Dễ kiểm soát automation đang chạy |

---

# 13. Rủi ro cần kiểm tra

| Nhóm | Rủi ro |
|---|---|
| Workflow | Node chưa nối nhưng vẫn cho kích hoạt |
| Workflow | Một canvas có nhiều trigger rời rạc gây khó hiểu |
| Điều kiện | Chưa rõ AND/OR giữa nhiều điều kiện |
| Điều kiện | Task đổi lịch nhưng lịch SMS không cập nhật |
| Điều kiện | Task bị hủy nhưng SMS vẫn gửi |
| SMS | Thiếu số điện thoại người nhận |
| SMS | Thiếu brandname |
| SMS | Biến trong SMS không có dữ liệu |
| SMS | Nội dung vượt số ký tự, phát sinh nhiều SMS |
| SMS | Gửi SMS trùng nhiều lần |
| Logs | Không có log chi tiết gây khó debug |
| Quyền | Người không có quyền vẫn sửa/kích hoạt automation |
| Chi phí | Gửi SMS hàng loạt phát sinh chi phí không kiểm soát |

---

# 14. Đề xuất cải thiện

| Vấn đề | Đề xuất |
|---|---|
| Sidebar trái dài | Chia nhóm theo Khách hàng, Email, Công việc, Cơ hội, Đơn hàng, Hệ thống |
| Trigger và action dễ lẫn | Tách rõ Điều kiện bắt đầu, Điều kiện kiểm tra, Hành động |
| Node chưa có cảnh báo | Thêm icon cảnh báo khi thiếu cấu hình |
| Panel cấu hình nhiều field | Chia thành section: Điều kiện, Thời gian, Nâng cao |
| Chưa thấy preview SMS | Bổ sung preview nội dung sau khi thay biến |
| Chưa thấy chạy thử | Bổ sung chức năng chạy thử với khách hàng/task mẫu |
| Chưa thấy cảnh báo chi phí SMS | Hiển thị số SMS dự kiến và chi phí ước tính |
| Logs chưa có hình chi tiết | Nên có log theo lần chạy và từng node |

---

# 15. Checklist kiểm thử

## 15.1. Danh sách automation

```text
[ ] Hiển thị danh sách automation
[ ] Tìm kiếm theo tên automation
[ ] Lọc theo nhóm automation
[ ] Lọc theo người tạo
[ ] Lọc theo ngày tạo
[ ] Lọc theo trạng thái
[ ] Hiển thị đúng trạng thái Đã kích hoạt / Chưa kích hoạt
[ ] Bấm vào automation mở đúng màn hình chi tiết
```

## 15.2. Tạo automation từ mẫu

```text
[ ] Bấm Thêm mới mở panel mẫu automation
[ ] Hiển thị danh sách mẫu
[ ] Tìm kiếm mẫu automation
[ ] Lọc mẫu theo nhóm
[ ] Chọn mẫu thành công
[ ] Workflow được sinh đúng theo mẫu
[ ] Tên automation được điền theo mẫu
[ ] Mô tả automation được copy từ mẫu
```

## 15.3. Workflow builder

```text
[ ] Thêm node trigger
[ ] Thêm node action
[ ] Kéo thả node
[ ] Kết nối node
[ ] Xóa node
[ ] Zoom in / zoom out canvas
[ ] Mini map hiển thị đúng
[ ] Node được chọn mở đúng panel cấu hình
[ ] Workflow chưa hợp lệ không được kích hoạt
```

## 15.4. Điều kiện bắt đầu

```text
[ ] Chọn trigger Tạo mới công việc
[ ] Chọn trigger KH đọc email
[ ] Chọn trigger Click link email
[ ] Chọn trigger Chỉnh sửa thông tin KH
[ ] Chọn trigger Thay đổi mối quan hệ
[ ] Chọn trigger Tạo mới đơn hàng
[ ] Trigger chỉ chạy khi có sự kiện thật phát sinh
```

## 15.5. Cấu hình điều kiện chi tiết

```text
[ ] Chọn trường Loại CV
[ ] Chọn toán tử Trong số
[ ] Chọn giá trị Họp nội bộ
[ ] Thêm điều kiện mới
[ ] Xóa điều kiện
[ ] Bật tính thời gian theo công việc
[ ] Chọn Trước khi bắt đầu công việc
[ ] Nhập 2 giờ 0 phút
[ ] Cập nhật cấu hình thành công
```

## 15.6. Gửi SMS tự động

```text
[ ] Chọn tên thương hiệu SMS
[ ] Chọn người nhận
[ ] Chọn mã chiến dịch SMS
[ ] Nhập nội dung SMS
[ ] Chèn biến vào nội dung SMS
[ ] Kiểm tra số ký tự SMS
[ ] Bật/tắt gửi SMS có dấu
[ ] Cảnh báo khi thiếu số điện thoại
[ ] Cảnh báo khi thiếu brandname
[ ] Gửi SMS đúng thời điểm
[ ] Không gửi SMS nếu task đã hủy
[ ] Không gửi trùng SMS
```

## 15.7. Logs

```text
[ ] Ghi log khi automation được kích hoạt
[ ] Ghi log khi trigger phát sinh
[ ] Ghi log từng node đã chạy
[ ] Ghi log gửi SMS thành công
[ ] Ghi log gửi SMS thất bại
[ ] Ghi log khi thiếu dữ liệu
[ ] Có thể xem đối tượng liên quan
[ ] Có thể retry hành động lỗi
```

---

# 16. Kết luận

Tab **Marketing Automation** là module workflow automation cho CRM, tập trung vào việc tự động hóa các nghiệp vụ chăm sóc khách hàng, nhắc lịch, theo dõi hành vi, giao việc và gửi SMS.

Các nhóm chức năng chính cần tài liệu hóa gồm:

```text
1. Danh sách automation
2. Tạo automation từ mẫu
3. Workflow builder
4. Điều kiện bắt đầu
5. Cấu hình điều kiện chi tiết
6. Hành động gửi SMS
7. Thông tin automation
8. Logs automation
9. Quản lý trạng thái automation
```

Khi kiểm thử hoặc triển khai, cần ưu tiên kiểm tra:

```text
Automation chạy khi nào?
Điều kiện chạy có đúng không?
Automation tác động lên ai?
SMS gửi cho ai?
SMS có gửi đúng thời điểm không?
Có gửi trùng không?
Khi lỗi có log đầy đủ không?
Có kiểm soát quyền và chi phí gửi SMS không?
```
