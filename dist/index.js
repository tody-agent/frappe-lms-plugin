#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getConfig } from "./config.js";
import { runSetup } from "./setup.js";
import { FrappeLMSClient } from "./frappe-client.js";
const TOOLS = [
    {
        name: "lms_list_courses",
        description: "Lấy danh sách các khoá học (LMS Course) hiện có trên hệ thống. Trả về: name, title, published, short_introduction.",
        inputSchema: {
            type: "object",
            properties: {
                limit: { type: "number", description: "Số lượng khoá học cần lấy (default: 20)" },
            },
        },
    },
    {
        name: "lms_get_course_details",
        description: "Lấy thông tin chi tiết đầy đủ của một khoá học (LMS Course) theo Name/ID.",
        inputSchema: {
            type: "object",
            properties: {
                course_name: { type: "string" },
            },
            required: ["course_name"],
        },
    },
    {
        name: "lms_create_course",
        description: "Tạo một khoá học mới (LMS Course).",
        inputSchema: {
            type: "object",
            properties: {
                title: { type: "string" },
                short_introduction: { type: "string" },
                published: { type: "number", enum: [0, 1], description: "1 = Published, 0 = Draft" },
            },
            required: ["title"],
        },
    },
    {
        name: "lms_publish_course",
        description: "[DANGER] REQUIRED: Ask the user for confirmation before executing. Publish hoặc ngưng Publish một LMS Course.",
        inputSchema: {
            type: "object",
            properties: {
                course_name: { type: "string" },
                published: { type: "number", enum: [0, 1] },
            },
            required: ["course_name", "published"],
        },
    },
    {
        name: "lms_create_chapter",
        description: "Tạo một Chương (Chapter) mới và gắn vào một Khoá học (Course) hiện có.",
        inputSchema: {
            type: "object",
            properties: {
                title: { type: "string" },
                course: { type: "string", description: "Name (ID) của LMS Course" },
                description: { type: "string" },
            },
            required: ["title", "course"],
        },
    },
    {
        name: "lms_create_lesson",
        description: "Tạo một Bài học (Lesson) mới và gắn vào một Chapter và Course hiện có. Có thể nhập Body (Markdown/HTML) hoặc Video URL.",
        inputSchema: {
            type: "object",
            properties: {
                title: { type: "string" },
                chapter: { type: "string", description: "Name (ID) của LMS Chapter" },
                course: { type: "string", description: "Name (ID) của LMS Course" },
                body: { type: "string", description: "Nội dung bài học dạng text/markdown/html" },
                video_link: { type: "string", description: "URL video YouTube/Vimeo/etc." },
            },
            required: ["title", "chapter", "course"],
        },
    },
    {
        name: "lms_delete_course",
        description: "[DANGER] REQUIRED: Ask the user for confirmation before executing. Xoá khoá học (LMS Course) dựa vào Name (ID).",
        inputSchema: {
            type: "object",
            properties: {
                course_name: { type: "string" },
            },
            required: ["course_name"],
        },
    },
    {
        name: "lms_delete_chapter",
        description: "[DANGER] REQUIRED: Ask the user for confirmation before executing. Xoá chương (LMS Chapter) dựa vào Name (ID).",
        inputSchema: {
            type: "object",
            properties: {
                chapter_name: { type: "string" },
            },
            required: ["chapter_name"],
        },
    },
    {
        name: "lms_delete_lesson",
        description: "[DANGER] REQUIRED: Ask the user for confirmation before executing. Xoá bài học (LMS Lesson) dựa vào Name (ID).",
        inputSchema: {
            type: "object",
            properties: {
                lesson_name: { type: "string" },
            },
            required: ["lesson_name"],
        },
    },
];
const server = new Server({ name: "frappe-lms-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
    })),
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const config = getConfig();
        const client = new FrappeLMSClient(config.url, config.token);
        let result;
        switch (name) {
            case "lms_list_courses":
                result = await client.listCourses(args.limit);
                break;
            case "lms_get_course_details":
                result = await client.getCourseDetails(args.course_name);
                break;
            case "lms_create_course":
                console.error(`[AUDIT - ${new Date().toISOString()}] CREATE_COURSE Payload: ${JSON.stringify(args)}`);
                result = await client.createCourse(args);
                break;
            case "lms_publish_course":
                console.error(`[AUDIT - ${new Date().toISOString()}] PUBLISH_COURSE Payload: ${JSON.stringify(args)}`);
                result = await client.publishCourse(args.course_name, args.published);
                break;
            case "lms_create_chapter":
                console.error(`[AUDIT - ${new Date().toISOString()}] CREATE_CHAPTER Payload: ${JSON.stringify(args)}`);
                result = await client.createChapter(args);
                break;
            case "lms_create_lesson":
                console.error(`[AUDIT - ${new Date().toISOString()}] CREATE_LESSON Payload: ${JSON.stringify(args)}`);
                result = await client.createLesson(args);
                break;
            case "lms_delete_course":
                console.error(`[AUDIT - ${new Date().toISOString()}] DELETE_COURSE Payload: ${JSON.stringify(args)}`);
                result = await client.deleteCourse(args.course_name);
                break;
            case "lms_delete_chapter":
                console.error(`[AUDIT - ${new Date().toISOString()}] DELETE_CHAPTER Payload: ${JSON.stringify(args)}`);
                result = await client.deleteChapter(args.chapter_name);
                break;
            case "lms_delete_lesson":
                console.error(`[AUDIT - ${new Date().toISOString()}] DELETE_LESSON Payload: ${JSON.stringify(args)}`);
                result = await client.deleteLesson(args.lesson_name);
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ Error: ${message}` }], isError: true };
    }
});
async function main() {
    if (process.argv[2] === "setup") {
        await runSetup();
        process.exit(0);
    }
    try {
        const config = getConfig();
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error(`Frappe LMS MCP v1.0.0 — target: ${config.url}`);
    }
    catch (err) {
        console.error("Initialization Error:", err.message);
        process.exit(1);
    }
}
main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
