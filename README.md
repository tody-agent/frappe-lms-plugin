# Frappe LMS MCP Plugin

Đây là công cụ mở rộng (MCP) giúp ChatGPT, Claude, Cursor hoặc Antigravity có khả năng giao tiếp và tự động tạo khóa học trên nền tảng **Frappe LMS** mà không cần gõ code. 

## Tính năng
- Đọc danh sách khóa học hiện có
- Viết khóa học mới
- Tạo Chương (Chapter) và gắn vào Khóa học
- Soạn Bài học (Lesson) với văn bản Markdown hoặc kèm video YouTube/Vimeo.
- Xóa Khóa học, Chương, và Bài học (Yêu cầu xác nhận từ con người).

## Tính năng Bảo mật & Rủi ro
- **Human-In-The-Loop (HITL):** Khi bạn yêu cầu AI **Xuất bản (Publish)** hoặc **Xóa (Delete)**, AI sẽ bị ép buộc phải hỏi lại bạn *(Ví dụ: "Bạn có chắc chắn muốn xuất bản không?")* để phòng ngừa rủi ro phá hoại. 
- **Audit Log:** Mọi hành động thao tác (Thêm/Sửa/Xóa) đều được ghi nhận (Log) lại vào cửa sổ màn hình console trên Antigravity/Claude.
- Khuyến nghị: Sử dụng tài khoản có Role giới hạn (không cấp tài khoản System Manager) cho Token.

## Yêu cầu
- Đã cài đặt [Node.js](https://nodejs.org/en) (v18 trở lên).
- Bạn có quyền Admin trên Frappe (Ví dụ: `team.boxme.asia`) để sinh Access Token.

## Lấy Access Token từ Frappe
1. Đăng nhập vào hệ thống LMS (VD: `https://team.boxme.asia/desk`).
2. Vào **My Settings** (hoặc User) -> **API Access**.
3. Bấm **Generate Keys**. Ghi lại `API Key` và `API Secret`.
4. Token của bạn sẽ là chuỗi ghép lại bằng dấu hai chấm `:`. Ví dụ: `da102938ab:bc82639201`.

---

## Cách cài đặt cho Non-Tech

### 1. Dùng cho ứng dụng Antigravity Desktop
Nếu bạn đang dùng Antigravity:
1. Vào mục `Plugins -> Manage -> Add marketplace`.
2. Dán link repository Github này vào ô URL (ví dụ: `omisocial/frappe-lms-mcp`).
3. Giao diện sẽ yêu cầu bạn truyền các tham số. Điền:
   - `--frappe_url`: Điền `https://team.boxme.asia`
   - `--api_token`: Điền chuỗi token `Key:Secret` của bạn vào đây.

### 2. Dùng cho Claude Desktop
1. Tải ứng dụng Claude Desktop.
2. Mở file cấu hình. Trên máy Mac: bạn mở Terminal và chạy lệnh sau (chỉ việc Copy -> Paste -> Enter):
   ```bash
   mkdir -p ~/Library/Application\ Support/Claude/ && touch ~/Library/Application\ Support/Claude/claude_desktop_config.json && open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```
3. Chép đoạn sau dán vào file cấu hình (thay thế URL và Token thành của bạn):
   ```json
   {
     "mcpServers": {
       "frappe-lms": {
         "command": "npx",
         "args": [
           "-y",
           "github:omisocial/frappe-lms-mcp",
           "--frappe_url", "https://team.boxme.asia",
           "--api_token", "api_key_cua_ban:api_secret_cua_ban"
         ]
       }
     }
   }
   ```
4. Khởi động lại ứng dụng Claude. Bạn sẽ thấy biểu tượng đinh ghim MCP báo hiệu đã cài đặt thành công.

### 3. Dùng cho Cursor IDE
1. Ở phần Setting (biểu tượng bánh răng) trên Cursor, tìm mục **Features** -> **MCP**.
2. Thêm một server mới:
   - **Type**: `command`
   - **Name**: `frappe-lms`
   - **Command**: `npx -y github:omisocial/frappe-lms-mcp --frappe_url "https://team.boxme.asia" --api_token "key:secret"`

---

## ⚡ Cách sử dụng
Một khi đã cài đặt xong, bạn có thể gõ chat bình thường với AI:
> "Hãy tạo cho tôi một khóa học có tên **Quy trình Onboarding Nhân viên mới**, gồm 2 chapter: Giới thiệu, và Nội quy. Mỗi chapter bao gồm 1 bài học bằng văn bản giới thiệu ngắn. Hãy xuất bản khóa học ngay."
> AI sẽ tự động gọi hệ thống Frappe và thực thi hoàn hảo!
