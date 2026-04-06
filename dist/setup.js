import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const ask = (query) => {
    return new Promise((resolve) => rl.question(query, resolve));
};
export async function runSetup() {
    console.log("\n🚀 CHÀO MỪNG ĐẾN VỚI BỘ CÀI ĐẶT FRAPPE LMS AI AGENT 🚀\n");
    console.log("Vui lòng chọn hệ thống AI bạn đang sử dụng:");
    console.log("[1] Claude Desktop (Khuyên dùng - Cài đặt tự động)");
    console.log("[2] Google Antigravity");
    console.log("[3] Cursor IDE");
    console.log("[4] Khác (Codex, OpenCode...)");
    let agentChoice = "";
    while (!["1", "2", "3", "4"].includes(agentChoice)) {
        agentChoice = (await ask("\nNhập lựa chọn của bạn (1-4): ")).trim();
    }
    const defaultUrl = "https://lms.yourdomain.com";
    let url = (await ask(`\nNhập link LMS của bạn (Mặc định: ${defaultUrl}): `)).trim();
    if (!url)
        url = defaultUrl;
    let token = "";
    while (!token) {
        token = (await ask("Nhập API Token của bạn: ")).trim();
        if (!token)
            console.log("Token không được để trống!");
    }
    const mcpCommand = `npx -y github:tody-agent/frappe-lms-plugin --frappe_url "${url}" --api_token "${token}"`;
    console.log("\n==================================");
    console.log("🛠️ HƯỚNG DẪN CÀI ĐẶT 🛠️");
    if (agentChoice === "1") {
        let configPath = "";
        if (process.platform === "darwin") {
            configPath = path.join(os.homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
        }
        else if (process.platform === "win32") {
            configPath = path.join(os.homedir(), "AppData", "Roaming", "Claude", "claude_desktop_config.json");
        }
        if (configPath) {
            try {
                const dir = path.dirname(configPath);
                if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, { recursive: true });
                let existingConfig = { mcpServers: {} };
                if (fs.existsSync(configPath)) {
                    const content = fs.readFileSync(configPath, "utf8");
                    if (content.trim())
                        existingConfig = JSON.parse(content);
                }
                if (!existingConfig.mcpServers)
                    existingConfig.mcpServers = {};
                existingConfig.mcpServers["frappe-lms"] = {
                    command: "npx",
                    args: [
                        "-y",
                        "github:tody-agent/frappe-lms-plugin",
                        "--frappe_url", url,
                        "--api_token", token
                    ]
                };
                fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
                console.log(`\n✅ Thành công! Đã tự động ghép nối cấu hình vào: ${configPath}`);
                console.log("Vui lòng khởi động lại phần mềm Claude Desktop để bắt đầu sử dụng MCP.");
            }
            catch (e) {
                console.log("\n⚠️ Cài đặt tự động thất bại do không có quyền ghi. Hãy cấu hình thủ công:");
                console.log("Mở file claude_desktop_config.json và dán:");
                console.log(JSON.stringify({ mcpServers: { "frappe-lms": { command: "npx", args: ["-y", "github:tody-agent/frappe-lms-plugin", "--frappe_url", url, "--api_token", token] } } }, null, 2));
            }
        }
        else {
            console.log("Hệ điều hành không hỗ trợ tự động tìm vị trí. Bạn cần sửa file claude_desktop_config.json theo mẫu MCP chuẩn.");
        }
    }
    else if (agentChoice === "2") {
        console.log(`\n1. Mở phần mềm Antigravity Desktop.`);
        console.log(`2. Vào menu Plugins -> Manage -> Add marketplace.`);
        console.log(`3. Nhập kho URL: tody-agent/frappe-lms-plugin (hoặc dán nguyên link Github).`);
        console.log(`4. Giao diện hiện bảng cài đặt, điền:`);
        console.log(`   - frappe_url: ${url}`);
        console.log(`   - api_token: ${token}`);
    }
    else if (agentChoice === "3") {
        console.log(`\n1. Mở phần Settings (Biểu tượng Bánh răng) của Cursor, tìm mục Features -> MCP.`);
        console.log(`2. Bấm '+ Add New MCP Server'.`);
        console.log(`3. Điền cấu hình như sau:`);
        console.log(`   - Type: command`);
        console.log(`   - Name: frappe-lms`);
        console.log(`   - Command: ${mcpCommand}`);
    }
    else {
        console.log(`\nHãy sao chép câu lệnh dưới đây và thiết lập MCP Server mới cho phần mềm của bạn:`);
        console.log(mcpCommand);
    }
    console.log("\n==================================");
    console.log("🎓 HƯỚNG DẪN SỬ DỤNG - ONBOARDING");
    console.log("Bước cuối: Cài đặt công cụ đọc File (chỉ làm 1 lần) bằng cách chạy lệnh Terminal ở màn hình chính phần mềm AI:");
    console.log("➡️ npx -y skills add https://github.com/anthropics/skills --skill docx --yes");
    console.log("➡️ npx -y skills add https://github.com/anthropics/skills --skill pdf --yes");
    console.log("➡️ npx -y skills add https://github.com/duc01226/easyplatform --skill pdf-to-markdown --yes\n");
    console.log("Ngay sau đó, bạn có thể chat khởi lệnh tạo giảng trình:");
    console.log(`🎯 "Xin chào, @/cm-lms-course-creator Hãy giúp tôi thiết kế khoá học từ file tài liệu quy_che_cong_ty.pdf này nhé!"\n`);
    console.log("Chúc bạn vận hành thành công! 👋\n");
    rl.close();
}
