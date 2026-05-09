# PHÂN TÍCH CHỨC NĂNG TAB TÀI CHÍNH

> Tài liệu mô tả các chức năng lớn và chức năng con của phân hệ **Tài chính** dựa trên các màn hình hiện tại.

---

## 1. Cấu trúc chức năng tổng quan

```text
Tài chính
├── 1. Trang chủ tài chính
├── 2. Quỹ
│   ├── Quản lý quỹ
│   ├── Phiếu thu
│   ├── Phiếu chi
│   └── Danh sách hạch toán quỹ
├── 3. Ngân sách
├── 4. Yêu cầu chi phí
├── 5. Công nợ
│   ├── Tổng quan công nợ
│   ├── Công nợ phải thu
│   ├── Công nợ phải trả
│   ├── Thống kê công nợ
│   ├── Dự đoán công nợ
│   └── Chi tiết công nợ
├── 6. Sổ cái
└── 7. Báo cáo tài chính
```

---

# FIN-01. Trang chủ tài chính

## 1.1. Mục đích

Trang chủ tài chính dùng để hiển thị nhanh tình hình tài chính tổng quan của doanh nghiệp, bao gồm dòng tiền, thu chi, tồn quỹ, công nợ và các hoạt động tài chính gần nhất.

## 1.2. Chức năng con

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-01-01 | Xem biểu đồ dòng tiền thu chi | Hiển thị biểu đồ dòng tiền theo ngày/tháng/khoảng thời gian |
| FIN-01-02 | Lọc thời gian dashboard | Cho phép lọc dữ liệu theo tháng này, quý này, năm này hoặc khoảng thời gian |
| FIN-01-03 | Tạo nhanh phiếu thu | Người dùng có thể tạo phiếu thu ngay từ dashboard |
| FIN-01-04 | Tạo nhanh phiếu chi | Người dùng có thể tạo phiếu chi ngay từ dashboard |
| FIN-01-05 | Xem cân đối thu chi | So sánh tổng thu và tổng chi trong kỳ |
| FIN-01-06 | Xem cơ cấu doanh thu theo sản phẩm | Hiển thị tỷ trọng doanh thu theo nhóm sản phẩm hoặc sản phẩm |
| FIN-01-07 | Xem hoạt động gần nhất | Hiển thị lịch sử thao tác như tạo phiếu thu, tạo phiếu chi, xuất tiền, thu tiền |
| FIN-01-08 | Xem tồn quỹ | Hiển thị danh sách quỹ và số dư hiện tại |
| FIN-01-09 | Xem công nợ tổng quan | Hiển thị nhanh danh sách khách hàng/công ty có công nợ |
| FIN-01-10 | Truy cập trợ giúp tài chính | Hiển thị các hướng dẫn thiết lập hệ thống tài chính |

## 1.3. Dữ liệu hiển thị chính

| Nhóm dữ liệu | Nội dung |
|---|---|
| Dòng tiền | Thu, chi, dòng tiền ròng |
| Tồn quỹ | Tên quỹ, số dư |
| Công nợ | Tên khách hàng/công ty, phải thu, phải trả |
| Hoạt động | Loại hoạt động, người thực hiện, thời gian |
| Trợ giúp | Các bài hướng dẫn thiết lập tài chính |

## 1.4. Gợi ý cải thiện

| Vấn đề hiện tại | Đề xuất |
|---|---|
| Dashboard thiếu KPI tổng quan nổi bật | Bổ sung card: Tổng thu, Tổng chi, Tồn quỹ, Công nợ phải thu, Công nợ phải trả |
| Một số biểu đồ đang trống | Hiển thị empty state rõ ràng khi chưa có dữ liệu |
| Label “Cân cân thu chi” chưa chuẩn | Đổi thành “Cân đối thu chi” |
| Dữ liệu tiền quá dài | Có thể format ngắn: 1.03 tỷ, 500.7 triệu |

---

# FIN-02. Quỹ

## 2.1. Mục đích

Chức năng Quỹ dùng để quản lý các nguồn tiền của doanh nghiệp như tiền mặt, tiền gửi ngân hàng, quỹ nội bộ, quỹ phòng ban hoặc quỹ dự án.

## 2.2. Chức năng con

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-02-01 | Xem danh sách quỹ | Hiển thị danh sách các quỹ hiện có |
| FIN-02-02 | Tạo mới quỹ | Tạo quỹ tiền mặt, quỹ ngân hàng hoặc quỹ nội bộ |
| FIN-02-03 | Cập nhật quỹ | Sửa tên quỹ, mô tả, người quản lý hoặc trạng thái |
| FIN-02-04 | Xóa/ngưng sử dụng quỹ | Xóa hoặc khóa quỹ không còn sử dụng |
| FIN-02-05 | Xem số dư quỹ | Hiển thị số tiền hiện còn trong từng quỹ |
| FIN-02-06 | Xem phiếu thu theo quỹ | Xem các khoản tiền vào của một quỹ |
| FIN-02-07 | Xem phiếu chi theo quỹ | Xem các khoản tiền ra của một quỹ |
| FIN-02-08 | Xem danh sách hạch toán quỹ | Hiển thị các bút toán liên quan đến quỹ |
| FIN-02-09 | Tìm kiếm/lọc quỹ | Tìm quỹ theo tên, trạng thái hoặc người quản lý |
| FIN-02-10 | Xuất dữ liệu quỹ | Xuất danh sách quỹ hoặc báo cáo tồn quỹ |

## 2.3. Quy tắc nghiệp vụ đề xuất

| Quy tắc | Mô tả |
|---|---|
| Không cho xóa quỹ đã có phát sinh | Nếu quỹ đã có phiếu thu/chi thì chỉ nên ngưng sử dụng |
| Số dư quỹ phải tự động cập nhật | Khi tạo phiếu thu thì tăng quỹ, tạo phiếu chi thì giảm quỹ |
| Quỹ âm cần có cảnh báo | Nếu chi vượt số dư, hệ thống cần cảnh báo hoặc chặn theo cấu hình |
| Quỹ phải có người quản lý | Mỗi quỹ nên có ít nhất một người chịu trách nhiệm |

---

# FIN-03. Phiếu thu

## 3.1. Mục đích

Phiếu thu dùng để ghi nhận các khoản tiền doanh nghiệp nhận được từ khách hàng, đơn hàng, hoàn ứng hoặc nguồn thu tự nhập.

## 3.2. Chức năng con

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-03-01 | Xem danh sách phiếu thu | Hiển thị danh sách các phiếu thu |
| FIN-03-02 | Tạo mới phiếu thu | Tạo phiếu thu tiền |
| FIN-03-03 | Cập nhật phiếu thu | Sửa thông tin phiếu thu khi còn được phép |
| FIN-03-04 | Chọn quỹ nhận tiền | Chọn quỹ tiền mặt/ngân hàng nhận khoản thu |
| FIN-03-05 | Chọn hình thức thanh toán | Tiền mặt, chuyển khoản hoặc hình thức khác |
| FIN-03-06 | Chọn nguồn thu | Tự nhập, đơn hàng bán, thu tiền khách hàng qua đơn hàng, hoàn ứng |
| FIN-03-07 | Chọn khách hàng nộp tiền | Liên kết khoản thu với khách hàng/công ty |
| FIN-03-08 | Thêm nhanh khách hàng | Tạo nhanh khách hàng nếu chưa có trong hệ thống |
| FIN-03-09 | Nhập số tiền thu | Nhập giá trị khoản thu |
| FIN-03-10 | Nhập người nộp tiền | Ghi nhận người nộp tiền thực tế |
| FIN-03-11 | Đính kèm chứng từ | Upload hóa đơn, ảnh, file chứng từ liên quan |
| FIN-03-12 | Thêm thông tin hạch toán | Khai báo tài khoản kế toán Nợ/Có |
| FIN-03-13 | Sinh số chứng từ | Hệ thống tự sinh số chứng từ sau khi lưu |
| FIN-03-14 | Ghi nhận vào quỹ | Cập nhật tăng số dư quỹ |
| FIN-03-15 | Cập nhật công nợ | Giảm công nợ phải thu nếu thu tiền khách hàng |
| FIN-03-16 | In/xuất phiếu thu | Xuất PDF hoặc in phiếu thu |

## 3.3. Các trường dữ liệu chính

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| Nội dung thu | Có | Diễn giải khoản thu |
| Ngày yêu cầu | Có | Ngày tạo/yêu cầu thu tiền |
| Quỹ | Có | Quỹ nhận tiền |
| Hình thức thanh toán | Không/Có theo cấu hình | Tiền mặt/chuyển khoản |
| Ngày chứng từ | Không | Có thể tự sinh hoặc tự cập nhật sau khi ghi sổ |
| Số chứng từ | Không | Thường tự sinh |
| Mô tả | Không | Diễn giải chi tiết |
| Nguồn | Có | Tự nhập, đơn hàng, hoàn ứng... |
| Khách hàng nộp tiền | Tùy nguồn | Bắt buộc nếu liên quan công nợ |
| Số tiền | Có | Phải lớn hơn 0 |
| Người nộp tiền | Không | Người nộp thực tế |
| Tài chứng từ | Không | File đính kèm |
| Hạch toán | Tùy cấu hình | Cần có nếu ghi sổ kế toán |

## 3.4. Luồng xử lý đề xuất

```text
Tạo phiếu thu
→ Nhập thông tin phiếu
→ Chọn nguồn thu
→ Chọn quỹ nhận tiền
→ Nhập khách hàng/người nộp tiền
→ Nhập số tiền
→ Đính kèm chứng từ nếu có
→ Thêm hạch toán nếu cần
→ Lưu phiếu
→ Tăng số dư quỹ
→ Cập nhật công nợ nếu có
→ Ghi sổ cái nếu đủ điều kiện
```

---

# FIN-04. Phiếu chi

## 4.1. Mục đích

Phiếu chi dùng để ghi nhận các khoản tiền doanh nghiệp chi ra, bao gồm chi phí nội bộ, thanh toán nhà cung cấp, chi hoàn tiền, chi theo yêu cầu chi phí hoặc chi từ đơn hàng.

## 4.2. Chức năng con

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-04-01 | Xem danh sách phiếu chi | Hiển thị danh sách phiếu chi |
| FIN-04-02 | Tạo mới phiếu chi | Tạo chứng từ chi tiền |
| FIN-04-03 | Cập nhật phiếu chi | Sửa thông tin phiếu chi khi còn được phép |
| FIN-04-04 | Chọn quỹ chi tiền | Chọn quỹ bị trừ tiền |
| FIN-04-05 | Chọn hình thức thanh toán | Tiền mặt, chuyển khoản hoặc hình thức khác |
| FIN-04-06 | Chọn nguồn chi | Tự nhập, yêu cầu chi phí, đơn hàng, hoàn tiền |
| FIN-04-07 | Chọn người nhận tiền | Nhân viên, khách hàng, nhà cung cấp hoặc đối tượng khác |
| FIN-04-08 | Nhập số tiền chi | Nhập số tiền cần chi |
| FIN-04-09 | Đính kèm chứng từ | Upload hóa đơn, phiếu đề nghị, file liên quan |
| FIN-04-10 | Thêm thông tin hạch toán | Khai báo tài khoản kế toán Nợ/Có |
| FIN-04-11 | Cập nhật tồn quỹ | Trừ số dư quỹ sau khi chi |
| FIN-04-12 | Cập nhật công nợ phải trả | Giảm công nợ phải trả nếu thanh toán cho đối tượng liên quan |
| FIN-04-13 | Liên kết yêu cầu chi phí | Tạo phiếu chi từ yêu cầu chi phí đã duyệt |
| FIN-04-14 | In/xuất phiếu chi | Xuất PDF hoặc in phiếu chi |

## 4.3. Quy tắc nghiệp vụ đề xuất

| Quy tắc | Mô tả |
|---|---|
| Số tiền chi phải lớn hơn 0 | Không cho tạo phiếu chi bằng 0 hoặc âm |
| Kiểm tra số dư quỹ | Nếu quỹ không đủ tiền thì cảnh báo hoặc chặn |
| Phiếu chi từ YCCP phải liên kết yêu cầu gốc | Đảm bảo truy vết từ yêu cầu đến chứng từ chi |
| Ghi nhận công nợ đúng đối tượng | Nếu chi trả cho khách hàng/nhà cung cấp thì cập nhật công nợ |
| Không sửa phiếu đã ghi sổ nếu không có quyền | Đảm bảo tính toàn vẹn kế toán |

---

# FIN-05. Ngân sách

## 5.1. Mục đích

Ngân sách dùng để thiết lập hạn mức chi phí cho phòng ban, dự án, chiến dịch, nhóm công việc hoặc kỳ tài chính.

## 5.2. Chức năng con

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-05-01 | Xem danh sách ngân sách | Hiển thị danh sách ngân sách |
| FIN-05-02 | Tìm kiếm ngân sách | Tìm theo tên ngân sách |
| FIN-05-03 | Lọc theo người tạo | Lọc ngân sách theo người tạo |
| FIN-05-04 | Lọc theo trạng thái | Đang sử dụng, ngưng sử dụng, hết hạn |
| FIN-05-05 | Lọc theo thời gian | Lọc theo ngày bắt đầu/kết thúc |
| FIN-05-06 | Tạo mới ngân sách | Tạo ngân sách mới |
| FIN-05-07 | Cập nhật ngân sách | Sửa thông tin ngân sách |
| FIN-05-08 | Xóa/ngưng ngân sách | Xóa hoặc khóa ngân sách |
| FIN-05-09 | Gán người quản lý | Chỉ định người chịu trách nhiệm ngân sách |
| FIN-05-10 | Gán người tham gia | Thêm nhân sự có quyền sử dụng/nghiệp vụ liên quan |
| FIN-05-11 | Tạo danh mục theo template | Tạo nhanh danh mục chi phí mẫu |
| FIN-05-12 | Đính kèm tài liệu ngân sách | Upload file kế hoạch, quyết định, chứng từ |
| FIN-05-13 | Theo dõi đã sử dụng | Tính tổng chi phí đã dùng |
| FIN-05-14 | Theo dõi còn lại | Tính ngân sách còn lại |
| FIN-05-15 | Cảnh báo vượt ngân sách | Cảnh báo khi yêu cầu chi phí vượt hạn mức |

## 5.3. Các trường dữ liệu chính

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| Tên ngân sách | Có | Tên ngân sách |
| Số tiền | Có | Tổng ngân sách được cấp |
| Ngày bắt đầu | Có | Ngày hiệu lực |
| Ngày kết thúc | Có | Ngày hết hiệu lực |
| Người quản lý | Có | Người phụ trách chính |
| Người tham gia | Không | Các nhân sự liên quan |
| Template danh mục | Không | Tạo danh mục chi phí mẫu |
| Mô tả | Không | Ghi chú |
| Tài liệu đính kèm | Không | File liên quan |

## 5.4. Công thức đề xuất

```text
Ngân sách còn lại = Tổng ngân sách - Tổng chi phí đã duyệt/đã xuất quỹ
```

## 5.5. Quy tắc nghiệp vụ đề xuất

| Quy tắc | Mô tả |
|---|---|
| Ngày kết thúc phải lớn hơn ngày bắt đầu | Đảm bảo kỳ ngân sách hợp lệ |
| Số tiền ngân sách phải lớn hơn 0 | Không cho tạo ngân sách bằng 0 hoặc âm |
| Tên ngân sách nên không trùng trong cùng kỳ | Tránh nhầm lẫn dữ liệu |
| YCCP nên liên kết ngân sách | Để kiểm soát định mức và số đã sử dụng |
| Không xóa ngân sách đã phát sinh | Chỉ nên khóa/ngưng sử dụng |

---

# FIN-06. Yêu cầu chi phí

## 6.1. Mục đích

Yêu cầu chi phí dùng để nhân sự tạo đề nghị thanh toán, tạm ứng hoặc hoàn ứng trước khi kế toán thực hiện xuất tiền.

## 6.2. Chức năng con

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-06-01 | Xem danh sách yêu cầu chi phí | Hiển thị danh sách yêu cầu |
| FIN-06-02 | Tìm kiếm theo nội dung | Tìm theo nội dung yêu cầu |
| FIN-06-03 | Tìm kiếm theo mã yêu cầu | Tìm theo mã PYC/PTU |
| FIN-06-04 | Lọc theo loại yêu cầu | Thanh toán, tạm ứng, hoàn ứng |
| FIN-06-05 | Lọc theo trạng thái | Chờ xác nhận, đang xử lý, chờ xuất quỹ, đã hoàn thành |
| FIN-06-06 | Lọc theo người yêu cầu | Xem yêu cầu theo nhân sự tạo |
| FIN-06-07 | Lọc theo người phê duyệt | Xem yêu cầu theo người duyệt |
| FIN-06-08 | Lọc theo thời gian | Lọc theo ngày bắt đầu/kết thúc |
| FIN-06-09 | Tạo mới yêu cầu chi phí | Tạo yêu cầu thanh toán/tạm ứng/hoàn ứng |
| FIN-06-10 | Cập nhật yêu cầu chi phí | Sửa yêu cầu khi chưa hoàn tất |
| FIN-06-11 | Chọn người phê duyệt | Gán người có trách nhiệm duyệt |
| FIN-06-12 | Nhập số tiền yêu cầu | Nhập tổng tiền đề nghị |
| FIN-06-13 | Liên kết đơn hàng | Gắn yêu cầu với đơn hàng nếu có |
| FIN-06-14 | Liên kết khách hàng | Gắn yêu cầu với khách hàng nếu có |
| FIN-06-15 | Nhập lý do yêu cầu | Nhập nội dung/lý do chi phí |
| FIN-06-16 | Đính kèm chứng từ | Upload hóa đơn, chứng từ, hình ảnh |
| FIN-06-17 | Thêm danh sách nội dung chi | Tạo các dòng chi tiết chi phí |
| FIN-06-18 | Phê duyệt yêu cầu | Người duyệt xác nhận yêu cầu |
| FIN-06-19 | Từ chối yêu cầu | Người duyệt từ chối và nhập lý do |
| FIN-06-20 | Chuyển sang chờ xuất quỹ | Sau khi duyệt, yêu cầu chuyển sang trạng thái chờ chi tiền |
| FIN-06-21 | Tạo phiếu chi từ yêu cầu | Kế toán tạo phiếu chi dựa trên yêu cầu đã duyệt |
| FIN-06-22 | Cập nhật đã cấp | Ghi nhận số tiền đã cấp |
| FIN-06-23 | In/xuất bản PDF | Xuất phiếu yêu cầu chi phí |
| FIN-06-24 | Xuất Excel danh sách yêu cầu | Export dữ liệu để báo cáo |

## 6.3. Loại yêu cầu chi phí

| Loại | Mô tả |
|---|---|
| Thanh toán | Đề nghị công ty thanh toán một khoản chi |
| Tạm ứng | Xin ứng trước tiền để thực hiện công việc |
| Hoàn ứng | Quyết toán lại số tiền đã tạm ứng |

## 6.4. Trạng thái đề xuất

```text
Nháp
→ Chờ xác nhận
→ Đang xử lý
→ Chờ xuất quỹ
→ Đã xuất quỹ
→ Đã hoàn thành
```

Nhánh ngoại lệ:

```text
Chờ xác nhận / Đang xử lý
→ Từ chối

Nháp / Chờ xác nhận
→ Hủy
```

## 6.5. Quy tắc nghiệp vụ đề xuất

| Quy tắc | Mô tả |
|---|---|
| Người yêu cầu không nên tự duyệt nếu không có quyền | Tránh sai quy trình kiểm soát |
| Số tiền yêu cầu phải lớn hơn 0 | Không cho tạo yêu cầu bằng 0 hoặc âm |
| Nếu có ngân sách thì phải kiểm tra hạn mức | Cảnh báo khi vượt ngân sách |
| Hoàn ứng phải liên kết với tạm ứng gốc | Đảm bảo quyết toán đúng |
| Sau khi xuất quỹ phải tạo phiếu chi | Đảm bảo dữ liệu quỹ và sổ cái đầy đủ |
| Mỗi bước cần lưu lịch sử xử lý | Ghi lại ai duyệt, ai sửa, thời gian, lý do |

---

# FIN-07. Công nợ

## 7.1. Mục đích

Công nợ dùng để theo dõi các khoản phải thu và phải trả giữa doanh nghiệp với khách hàng, nhà cung cấp hoặc đối tượng liên quan.

## 7.2. Chức năng con cấp 1

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-07-01 | Xem tổng quan công nợ | Hiển thị danh sách công nợ tổng hợp |
| FIN-07-02 | Xem công nợ phải thu | Hiển thị các khoản khách hàng còn nợ doanh nghiệp |
| FIN-07-03 | Xem công nợ phải trả | Hiển thị các khoản doanh nghiệp còn phải trả |
| FIN-07-04 | Xem thống kê công nợ | Thống kê công nợ theo thời gian/nhóm khách hàng |
| FIN-07-05 | Xem dự đoán công nợ | Dự đoán hoặc cảnh báo công nợ có rủi ro |
| FIN-07-06 | Xem công nợ chi tiết | Xem chi tiết phát sinh theo từng khách hàng/công ty |

## 7.3. Chức năng con trên danh sách công nợ

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-07-07 | Tìm theo tên công ty | Tìm khách hàng/công ty |
| FIN-07-08 | Tìm theo mã số thuế | Lọc theo mã số thuế |
| FIN-07-09 | Lọc theo người phụ trách | Lọc khách hàng theo nhân viên phụ trách |
| FIN-07-10 | Lọc theo nhóm khách hàng | Lọc theo nhóm/loại khách hàng |
| FIN-07-11 | Lọc theo thời gian | Xem công nợ trong một kỳ |
| FIN-07-12 | Lọc theo trạng thái/loại | Tất cả, còn nợ, quá hạn, công nợ âm |
| FIN-07-13 | Xuất dữ liệu công nợ | Export danh sách công nợ |
| FIN-07-14 | Import dữ liệu công nợ | Nhập dữ liệu công nợ từ file |
| FIN-07-15 | Tính lại công nợ | Recalculate số liệu công nợ |
| FIN-07-16 | Sắp xếp theo tuổi nợ | Ưu tiên khoản nợ lâu ngày |
| FIN-07-17 | Xem chi tiết khách hàng | Mở màn hình chi tiết công nợ |

## 7.4. Chức năng con trong chi tiết công nợ

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-07-18 | Xem thông tin khách hàng | Tên, số điện thoại, trạng thái cập nhật |
| FIN-07-19 | Xem công nợ hiện tại | Số dư công nợ ròng |
| FIN-07-20 | Xem công nợ phải thu | Tổng số tiền cần thu |
| FIN-07-21 | Xem công nợ phải trả | Tổng số tiền cần trả |
| FIN-07-22 | Xem tab chi tiết công nợ | Danh sách phát sinh nợ/có |
| FIN-07-23 | Xem tab đơn hàng | Các đơn hàng liên quan công nợ |
| FIN-07-24 | Xem tab lịch sử | Lịch sử thu tiền, chi tiền, điều chỉnh |
| FIN-07-25 | Lọc chi tiết theo ngày | Lọc phát sinh theo khoảng ngày |
| FIN-07-26 | In báo cáo công nợ | In/xuất báo cáo công nợ khách hàng |
| FIN-07-27 | Tính lại công nợ khách hàng | Recalculate riêng cho một khách hàng |

## 7.5. Công thức đề xuất

```text
Công nợ hiện tại = Công nợ phải thu - Công nợ phải trả
```

```text
Công nợ phải thu tăng khi:
- Tạo đơn hàng bán chưa thanh toán
- Ghi nhận khoản khách hàng còn nợ

Công nợ phải thu giảm khi:
- Tạo phiếu thu từ khách hàng
- Đơn hàng được thanh toán

Công nợ phải trả tăng khi:
- Doanh nghiệp phát sinh nghĩa vụ trả tiền
- Có khoản hoàn tiền/chi trả cho khách hàng hoặc nhà cung cấp

Công nợ phải trả giảm khi:
- Tạo phiếu chi thanh toán
```

## 7.6. Quy tắc nghiệp vụ đề xuất

| Quy tắc | Mô tả |
|---|---|
| Mỗi phát sinh công nợ phải có nguồn gốc | Đơn hàng, phiếu thu, phiếu chi, điều chỉnh |
| Công nợ âm phải được hiển thị rõ | Thể hiện doanh nghiệp đang trả trước/nợ ngược |
| Tuổi công nợ phải có định nghĩa rõ | Tính từ ngày chứng từ, ngày đơn hàng hoặc ngày đến hạn |
| Recalculate cần có phân quyền | Vì ảnh hưởng dữ liệu tài chính |
| Dữ liệu công nợ cần audit log | Ghi nhận người tạo/sửa/tính lại |

---

# FIN-08. Sổ cái

## 8.1. Mục đích

Sổ cái dùng để ghi nhận các bút toán kế toán phát sinh từ phiếu thu, phiếu chi, công nợ, quỹ và các nghiệp vụ tài chính khác.

## 8.2. Chức năng con

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-08-01 | Xem danh sách bút toán | Hiển thị các dòng hạch toán |
| FIN-08-02 | Lọc theo tài khoản kế toán | Xem phát sinh theo mã tài khoản |
| FIN-08-03 | Lọc theo thời gian | Xem bút toán theo kỳ |
| FIN-08-04 | Lọc theo loại chứng từ | Phiếu thu, phiếu chi, đơn hàng, điều chỉnh |
| FIN-08-05 | Xem ngày ghi sổ | Ngày kế toán ghi nhận |
| FIN-08-06 | Xem ngày chứng từ | Ngày phát sinh chứng từ gốc |
| FIN-08-07 | Xem số chứng từ | Mã chứng từ liên quan |
| FIN-08-08 | Xem tài khoản Nợ/Có | Hiển thị tài khoản quỹ, đối ứng, thuế |
| FIN-08-09 | Xem phiếu thanh toán liên quan | Mở phiếu thu/chi gốc |
| FIN-08-10 | Kiểm tra cân đối bút toán | Tổng Nợ phải bằng tổng Có |
| FIN-08-11 | Export sổ cái | Xuất Excel/PDF |
| FIN-08-12 | In sổ cái | In báo cáo sổ cái theo kỳ |

## 8.3. Quy tắc nghiệp vụ đề xuất

| Quy tắc | Mô tả |
|---|---|
| Bút toán phải cân đối | Tổng phát sinh Nợ = Tổng phát sinh Có |
| Không sửa trực tiếp bút toán đã khóa kỳ | Nếu cần sửa phải tạo bút toán điều chỉnh |
| Chứng từ gốc phải truy vết được | Mỗi bút toán cần liên kết đến phiếu/đơn gốc |
| Báo cáo tài chính nên lấy từ sổ cái | Không nên lấy trực tiếp từ phiếu thu/chi |

---

# FIN-09. Báo cáo tài chính

## 9.1. Mục đích

Báo cáo tài chính dùng để tổng hợp dữ liệu kế toán theo chuẩn báo cáo, giúp doanh nghiệp xem tình hình tài chính, kết quả kinh doanh và lưu chuyển tiền tệ.

## 9.2. Chức năng con

| Mã | Chức năng con | Mô tả |
|---|---|---|
| FIN-09-01 | Xem báo cáo tình hình tài chính B01A | Báo cáo theo mẫu B01A |
| FIN-09-02 | Xem báo cáo tình hình tài chính B01B | Báo cáo theo mẫu B01B |
| FIN-09-03 | Xem bảng cân đối kế toán B01-DN | Báo cáo tài sản, nguồn vốn |
| FIN-09-04 | Xem báo cáo kết quả hoạt động kinh doanh | Báo cáo doanh thu, chi phí, lợi nhuận |
| FIN-09-05 | Xem báo cáo kết quả kinh doanh B02-DN | Báo cáo theo mẫu B02-DN |
| FIN-09-06 | Xem lưu chuyển tiền tệ B03-DN | Báo cáo dòng tiền |
| FIN-09-07 | Lọc theo thời gian | Chọn từ ngày/đến ngày |
| FIN-09-08 | Lọc theo tài khoản | Xem dữ liệu theo tài khoản kế toán |
| FIN-09-09 | Xem số dư đầu kỳ | Số dư Nợ/Có đầu kỳ |
| FIN-09-10 | Xem phát sinh trong kỳ | Phát sinh Nợ/Có trong kỳ |
| FIN-09-11 | Xem số dư cuối kỳ | Số dư Nợ/Có cuối kỳ |
| FIN-09-12 | Drill-down tài khoản | Bấm vào tài khoản để xem chi tiết phát sinh |
| FIN-09-13 | Export báo cáo | Xuất Excel/PDF |
| FIN-09-14 | In báo cáo | In báo cáo tài chính |

## 9.3. Dữ liệu báo cáo chính

| Cột | Ý nghĩa |
|---|---|
| Số hiệu tài khoản | Mã tài khoản kế toán |
| Tên tài khoản | Tên tài khoản |
| Số dư đầu kỳ Nợ | Số dư Nợ đầu kỳ |
| Số dư đầu kỳ Có | Số dư Có đầu kỳ |
| Phát sinh Nợ trong kỳ | Tổng phát sinh Nợ |
| Phát sinh Có trong kỳ | Tổng phát sinh Có |
| Số dư cuối kỳ Nợ | Số dư Nợ cuối kỳ |
| Số dư cuối kỳ Có | Số dư Có cuối kỳ |

## 9.4. Quy tắc nghiệp vụ đề xuất

| Quy tắc | Mô tả |
|---|---|
| Báo cáo lấy dữ liệu từ sổ cái | Đảm bảo tính kế toán nhất quán |
| Tài khoản 111/112 liên kết quỹ | Tiền mặt/ngân hàng phải khớp tồn quỹ |
| Tài khoản 131 liên kết công nợ phải thu | Công nợ khách hàng phải khớp tài khoản kế toán |
| Tài khoản 331 liên kết công nợ phải trả | Công nợ phải trả phải khớp tài khoản kế toán |
| Có thể khóa kỳ báo cáo | Khi đã chốt kỳ thì hạn chế chỉnh sửa dữ liệu |

---

# 10. Mapping chức năng với dữ liệu ảnh hưởng

| Chức năng | Ảnh hưởng Quỹ | Ảnh hưởng Công nợ | Ảnh hưởng Sổ cái | Ảnh hưởng Báo cáo |
|---|---:|---:|---:|---:|
| Tạo phiếu thu | Có | Có, nếu liên quan khách hàng | Có | Có |
| Tạo phiếu chi | Có | Có, nếu liên quan đối tượng công nợ | Có | Có |
| Tạo yêu cầu chi phí | Chưa, đến khi xuất quỹ | Có thể có | Chưa hoặc có theo cấu hình | Có sau khi ghi sổ |
| Duyệt yêu cầu chi phí | Chưa | Chưa | Chưa | Chưa |
| Xuất quỹ từ YCCP | Có | Có thể có | Có | Có |
| Tạo ngân sách | Không | Không | Không | Không trực tiếp |
| Sử dụng ngân sách | Có thể khi chi | Không trực tiếp | Có thể | Có thể |
| Tính lại công nợ | Không trực tiếp | Có | Có thể | Có thể |
| Ghi sổ cái | Không trực tiếp | Không trực tiếp | Có | Có |
| Báo cáo tài chính | Không | Không | Đọc dữ liệu | Có |

---

# 11. Thứ tự ưu tiên phát triển/kiểm thử

| Ưu tiên | Nhóm chức năng | Lý do |
|---|---|---|
| 1 | Quỹ | Là nguồn tiền nền tảng |
| 2 | Phiếu thu / Phiếu chi | Là nghiệp vụ phát sinh tiền thật |
| 3 | Yêu cầu chi phí | Là quy trình phê duyệt trước khi chi |
| 4 | Công nợ | Phụ thuộc nhiều vào đơn hàng, phiếu thu, phiếu chi |
| 5 | Sổ cái | Phụ thuộc vào chứng từ và hạch toán |
| 6 | Báo cáo tài chính | Phụ thuộc vào sổ cái |
| 7 | Dashboard | Là nơi tổng hợp dữ liệu từ các phân hệ còn lại |

---

# 12. Checklist kiểm thử tổng quát

## 12.1. Kiểm thử Quỹ

- [ ] Tạo mới quỹ thành công
- [ ] Cập nhật thông tin quỹ
- [ ] Không cho xóa quỹ đã phát sinh
- [ ] Số dư quỹ tăng khi tạo phiếu thu
- [ ] Số dư quỹ giảm khi tạo phiếu chi
- [ ] Cảnh báo khi chi vượt số dư

## 12.2. Kiểm thử Phiếu thu

- [ ] Tạo phiếu thu tự nhập
- [ ] Tạo phiếu thu liên kết khách hàng
- [ ] Tạo phiếu thu liên kết đơn hàng
- [ ] Cập nhật tồn quỹ sau khi thu
- [ ] Cập nhật công nợ sau khi thu
- [ ] Sinh số chứng từ đúng
- [ ] Upload chứng từ thành công
- [ ] In/xuất PDF phiếu thu

## 12.3. Kiểm thử Phiếu chi

- [ ] Tạo phiếu chi tự nhập
- [ ] Tạo phiếu chi từ yêu cầu chi phí
- [ ] Cập nhật tồn quỹ sau khi chi
- [ ] Cập nhật công nợ phải trả nếu có
- [ ] Không cho chi vượt quỹ nếu cấu hình chặn
- [ ] Upload chứng từ thành công
- [ ] In/xuất PDF phiếu chi

## 12.4. Kiểm thử Ngân sách

- [ ] Tạo ngân sách mới
- [ ] Gán người quản lý
- [ ] Gán người tham gia
- [ ] Kiểm tra ngày bắt đầu/kết thúc
- [ ] Kiểm tra số tiền ngân sách
- [ ] Theo dõi đã sử dụng
- [ ] Theo dõi còn lại
- [ ] Cảnh báo vượt ngân sách

## 12.5. Kiểm thử Yêu cầu chi phí

- [ ] Tạo yêu cầu thanh toán
- [ ] Tạo yêu cầu tạm ứng
- [ ] Tạo yêu cầu hoàn ứng
- [ ] Phê duyệt yêu cầu
- [ ] Từ chối yêu cầu
- [ ] Chuyển trạng thái chờ xuất quỹ
- [ ] Tạo phiếu chi từ yêu cầu
- [ ] Cập nhật đã cấp
- [ ] Xuất PDF yêu cầu

## 12.6. Kiểm thử Công nợ

- [ ] Công nợ tăng khi phát sinh đơn hàng chưa thanh toán
- [ ] Công nợ giảm khi tạo phiếu thu
- [ ] Công nợ phải trả tăng khi phát sinh nghĩa vụ trả
- [ ] Công nợ phải trả giảm khi tạo phiếu chi
- [ ] Công nợ hiện tại tính đúng
- [ ] Tuổi công nợ tính đúng
- [ ] Chi tiết công nợ hiển thị đúng phát sinh
- [ ] Tính lại công nợ hoạt động đúng
- [ ] In báo cáo công nợ

## 12.7. Kiểm thử Sổ cái

- [ ] Phiếu thu sinh bút toán đúng
- [ ] Phiếu chi sinh bút toán đúng
- [ ] Bút toán cân đối Nợ/Có
- [ ] Lọc sổ cái theo tài khoản
- [ ] Lọc sổ cái theo thời gian
- [ ] Truy vết được chứng từ gốc

## 12.8. Kiểm thử Báo cáo tài chính

- [ ] Số dư đầu kỳ đúng
- [ ] Phát sinh trong kỳ đúng
- [ ] Số dư cuối kỳ đúng
- [ ] Dữ liệu khớp sổ cái
- [ ] Lọc theo thời gian đúng
- [ ] Lọc theo tài khoản đúng
- [ ] Export báo cáo thành công

---

# 13. Kết luận

Phân hệ Tài chính hiện tại có phạm vi khá rộng, bao gồm cả tài chính vận hành và kế toán cơ bản. Để hệ thống chạy đúng, cần đảm bảo các nghiệp vụ lõi như **quỹ, phiếu thu, phiếu chi, yêu cầu chi phí và công nợ** được xử lý chính xác trước. Sau đó mới kiểm tra tiếp **sổ cái, báo cáo tài chính và dashboard tổng hợp**.

Nguyên tắc quan trọng:

```text
Phiếu thu/chi tạo ra phát sinh tiền.
Yêu cầu chi phí tạo ra quy trình đề nghị và phê duyệt.
Ngân sách kiểm soát hạn mức.
Công nợ theo dõi nghĩa vụ phải thu/phải trả.
Sổ cái ghi nhận bút toán kế toán.
Báo cáo tài chính lấy dữ liệu từ sổ cái.
```
