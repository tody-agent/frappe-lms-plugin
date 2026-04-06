export function getConfig() {
    const args = process.argv.slice(2);
    let url = process.env.FRAPPE_URL || "https://team.boxme.asia";
    let token = process.env.FRAPPE_API_TOKEN || "";
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--frappe_url" && args[i + 1]) {
            url = args[i + 1];
            i++;
        }
        else if (args[i] === "--api_token" && args[i + 1]) {
            token = args[i + 1];
            i++;
        }
    }
    if (!token) {
        throw new Error("Missing API Token. Vui lòng cung cấp tham số --api_token 'API_KEY:API_SECRET' hoặc qua biến môi trường FRAPPE_API_TOKEN.");
    }
    url = url.replace(/\/$/, "");
    return { url, token };
}
