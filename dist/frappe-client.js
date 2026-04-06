import fetch from "node-fetch";
export class FrappeLMSClient {
    url;
    token;
    constructor(url, token) {
        this.url = url.replace(/\/$/, "");
        this.token = token;
    }
    get headers() {
        return {
            Authorization: `token ${this.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        };
    }
    async request(endpoint, options = {}) {
        const url = `${this.url}/api/${endpoint}`;
        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...this.headers, ...options.headers },
            });
            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(`Frappe API Error (${response.status} ${response.statusText}): ${responseText}`);
            }
            try {
                return JSON.parse(responseText);
            }
            catch (e) {
                return responseText;
            }
        }
        catch (err) {
            throw new Error(`Fetch failed: ${err.message}`);
        }
    }
    // --- LMS Courses ---
    async listCourses(limit = 20) {
        const res = await this.request(`resource/LMS Course?limit=${limit}&fields=["name","title","published","short_introduction"]`);
        return res.data || [];
    }
    async getCourseDetails(courseId) {
        const courseRes = await this.request(`resource/LMS Course/${courseId}`);
        return courseRes.data;
    }
    async createCourse(data) {
        const res = await this.request(`resource/LMS Course`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res.data;
    }
    async publishCourse(courseId, published) {
        const res = await this.request(`resource/LMS Course/${courseId}`, {
            method: "PUT",
            body: JSON.stringify({ published }),
        });
        return res.data;
    }
    async deleteCourse(courseId) {
        const res = await this.request(`resource/LMS Course/${courseId}`, {
            method: "DELETE",
        });
        return res.data;
    }
    // --- LMS Chapters ---
    async createChapter(data) {
        const res = await this.request(`resource/LMS Chapter`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res.data;
    }
    async deleteChapter(chapterId) {
        const res = await this.request(`resource/LMS Chapter/${chapterId}`, {
            method: "DELETE",
        });
        return res.data;
    }
    // --- LMS Lessons ---
    async createLesson(data) {
        // Determine input structure based on what was passed
        const payload = {
            title: data.title,
            chapter: data.chapter,
            course: data.course,
        };
        if (data.body) {
            payload.include_text = 1;
            payload.body = data.body;
        }
        if (data.video_link) {
            payload.video_link = data.video_link;
        }
        const res = await this.request(`resource/LMS Lesson`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        return res.data;
    }
    async deleteLesson(lessonId) {
        const res = await this.request(`resource/LMS Lesson/${lessonId}`, {
            method: "DELETE",
        });
        return res.data;
    }
}
