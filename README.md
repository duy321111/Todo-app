# 📋 Todo Application (MERN Stack)

Một ứng dụng quản lý công việc (Todo List) xây dựng trên nền tảng (MongoDB, Express, React, Node.js) 

---

## ✨ Các tính năng nổi bật

- **Quản lý công việc (CRUD):** Thêm mới, xem danh sách, chỉnh sửa tiêu đề/mô tả và xóa công việc.
- **Thay đổi trạng thái nhanh:** Nhấp trực tiếp để chuyển đổi trạng thái hoàn thành (`Chưa xong` / `Đã xong`).
- **Tìm kiếm & Bộ lọc linh hoạt:** 
  - Tìm kiếm (Debounced Search) theo tiêu đề và mô tả.
  - Lọc công việc theo trạng thái (`Tất cả`, `Chưa xong`, `Đã xong`).
  - Sắp xếp linh hoạt (`Mới nhất`, `Cũ nhất`, `Tiêu đề A-Z`, `Tiêu đề Z-A`).
- **Giao diện thẻ Badge tiện lợi:** Các bộ lọc đang áp dụng hiển thị dưới dạng thẻ pill/badge hiện đại, có nút xóa nhanh `x` riêng biệt và nút dọn dẹp `"Xóa tất cả"`.
- **Thiết kế phân vùng thu gọn (Collapsible Panels):** Form thêm mới và khu vực Bộ lọc hoạt động độc lập, giúp tiết kiệm tối đa không gian màn hình.
- **Tích hợp thời gian tạo:** Mỗi đầu việc hiển thị rõ thời gian tạo cụ thể kèm icon đồng hồ trực quan.
- **Cuộn danh sách thông minh (Scroll Y):** Danh sách Todo tự động giới hạn chiều cao tối đa và có scrollbar tùy biến thanh thoát, tránh việc đẩy chân trang quá lớn.
- **Responsive hoàn chỉnh:** Tối ưu hóa UI/UX hoàn toàn trên cả màn hình di động, máy tính bảng và máy tính để bàn.

---

## 🛠️ Xử lý dữ liệu không hợp lệ & Lỗi (Validation & Error Handling)

Dự án áp dụng cơ chế xác thực dữ liệu chặt chẽ ở cả **Frontend** và **Backend**:

1. **Ở phía Client (Frontend):**
   - **Xác thực ký tự thời gian thực (Soft validation limits):** Giới hạn tối đa **100 ký tự** cho tiêu đề & **1000 ký tự** cho mô tả. Khi vượt quá, hệ thống hiển thị đếm số ký tự đỏ nổi bật và **tự động vô hiệu hóa (disable)** nút Thêm/Lưu.
   - **Bắt lỗi chuỗi trống:** Tiêu đề bắt buộc nhập và không được chứa nguyên ký tự khoảng trắng (`.trim()`).
   - **Hiển thị lỗi trực quan:** Các lỗi phản hồi từ API/mạng được hiển thị qua banner thông báo đỏ trên đầu trang.
2. **Ở phía Server (Backend):**
   - **Mongoose Schema constraints:** Ràng buộc `required` đối với tiêu đề, tự động cắt khoảng trắng đầu cuối (`trim`) và kiểm tra `maxlength` thông qua MongoDB Schema.
   - **Phản hồi mã trạng thái HTTP:** Hộp kiểm tra đầu vào trước khi lưu ghi rõ lỗi và trả về mã lỗi thích hợp (`400 Bad Request` hoặc `404 Not Found`).

---

## 📂 Cấu trúc dự án

```text
Todo_List/
├── backend/
│   ├── config/          # Quản lý kết nối MongoDB
│   ├── controllers/     # Xử lý logic API (CRUD, Search, Pagination)
│   ├── models/          # MongoDB Schema (Mongoose)
│   ├── routes/          # Định tuyến API
│   ├── server.js        # File khởi chạy máy chủ Express
│   └── .env             # File cấu hình môi trường (Port, MongoDB URI)
│
├── frontend/
│   ├── src/
│   │   ├── assets/      # Lưu trữ CSS cơ sở & Biến giao diện
│   │   ├── components/  # Các component dùng chung (TodoForm, TodoItem, TodoList, SearchFilter)
│   │   ├── pages/       # Layout trang chính (TodoPage)
│   │   ├── services/    # Cấu hình API client (Axios)
│   │   ├── main.jsx     # Điểm khởi chạy React
│   │   └── App.jsx      # Thiết lập ứng dụng tổng
│   └── index.html
└── README.md            # Tài liệu hướng dẫn sử dụng dự án
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Điều kiện tiên quyết
- Máy tính đã cài đặt **Node.js** (Khuyên dùng v16 trở lên).
- Đang có một máy chủ **MongoDB** cục bộ đang chạy hoặc chuỗi kết nối **MongoDB Atlas** trực tuyến.

---

### Bước 1: Khởi tạo và khởi chạy Backend (Cổng mặc định: 5000)

1. Mở terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Tạo một file `.env` ở trong thư mục `backend` căn cứ theo file mẫu hoặc cấu hình trực tiếp:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/todo_database
   ```
4. Khởi chạy máy chủ ở chế độ phát triển (bật tự tải lại qua nodemon):
   ```bash
   npm run dev
   ```
   Nếu màn hình hiển thị:
   > `Server is running on port 5000`  
   > `MongoDB Connected`  
   Thì máy chủ backend đã hoạt động thành công!

---

### Bước 2: Khởi tạo và khởi chạy Frontend (Cổng mặc định: 5173)

1. Mở một terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy giao diện phát triển:
   ```bash
   npm run dev
   ```
4. Truy cập liên kết [http://localhost:5173](http://localhost:5173) trên trình duyệt để trải nghiệm toàn bộ ứng dụng!

---

## 🐳 Hướng dẫn chạy bằng Docker (Docker Compose)

Dự án đã được cấu hình sẵn Docker để chạy đồng thời cả Frontend, Backend và Database MongoDB.

### Yêu cầu
- Đã cài đặt và mở **Docker Desktop** trên máy.

### Các bước khởi chạy:
1. Mở terminal tại thư mục gốc của dự án và chạy:
   ```bash
   docker-compose up --build -d
   ```
2. Truy cập ứng dụng qua các đường dẫn sau:
   * **Frontend:** [http://localhost:3000](http://localhost:3000)
   * **Backend API:** [http://localhost:5000/api/todos](http://localhost:5000/api/todos)

### Dừng chạy:
```bash
docker-compose down
```

### Minh họa trạng thái hoạt động:
![Docker Compose Running](/docker_running.png)



