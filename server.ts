import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits for larger base64 images upload (canvas exports)
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Initialize Gemini client on the server side
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. Falling back to simulated pedagogical responses.");
  }

  // API endpoint for evaluating drawings
  app.post("/api/evaluate-drawing", async (req, res) => {
    try {
      const { studentName, templateName, imageBase64 } = req.body;

      if (!studentName || !templateName) {
        return res.status(400).json({ error: "Thiếu dữ liệu học sinh hoặc đề tài tác phẩm." });
      }

      // If API key is available, use real Gemini models
      if (ai) {
        let contents: any[] = [];
        
        // If they provided a base64 image, extract the pure base64 data
        if (imageBase64 && imageBase64.includes("base64,")) {
          const base64Data = imageBase64.split("base64,")[1];
          contents.push({
            inlineData: {
              mimeType: "image/png",
              data: base64Data,
            },
          });
        }

        contents.push({
          text: `Bạn là cô giáo dạy vẽ Tiểu học tên là Điệp, vô cùng tâm lý, dịu dàng và nhiệt huyết. Hãy nhận xét một bài vẽ tô màu mĩ thuật bằng tiếng Việt của em học sinh lớp 3 tên là "${studentName}".
Đề tài bức vẽ: "${templateName}".
Hãy viết một lời khen rực rỡ, tích cực về cách phối màu sắc, độ tươi sáng đầy sáng tạo, và truyền cho em thật nhiều năng lực học tập vui vẻ. Đưa ra 1 gợi ý nhẹ nhàng, khuyến khích em vẽ tiếp hoặc phối thêm màu khác. Hãy viết ngắn gọn (khoảng 3-4 câu), ngọt ngào, dễ thương, có chèn một số emoji vui tươi. Tránh phân tích quá học thuật.`,
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            temperature: 0.9,
          },
        });

        const textResponse = response.text || "Cô Điệp nhận thấy bức tranh của em có một vẻ đẹp diệu kỳ và tràn đầy sức sống trẻ thơ!";
        return res.json({ result: textResponse });
      } else {
        // Fallback responses when API key is missing
        const templatesVietnamese: Record<string, string> = {
          fish: "Cá Vàng Đại Dương",
          bird: "Bồ Câu Hòa Bình",
          pagoda: "Chùa Một Cột",
          halong: "Vịnh Hạ Long Kì Vĩ",
        };
        const prettyTemplate = templatesVietnamese[templateName] || templateName;
        const compliments = [
          `Ôi, cô Điệp vô cùng bất ngờ trước bức vẽ "${prettyTemplate}" của học sinh ${studentName} đấy! Em phối màu hết sức phóng khoáng, các gam sắc phản chiếu rõ tâm hồn hồn nhiên, vui tươi và năng động của em. Hãy tiếp tục sáng tạo các thế giới AR kì diệu này nhé! 🎉✨`,
          `Bài vẽ "${prettyTemplate}" của con thật trong trẻo và rực rỡ! Màu sắc hòa quyện sinh động y như một bức tranh phép thuật thực thụ vậy. Lớp 3A tự hào về con lắm đó, hãy phối thêm một chút màu nhũ hoặc vàng óng để tác phẩm tỏa sáng hơn nữa nhé! 🐠💖`,
          `Cô giáo mĩ thuật Điệp khen ngợi tinh thần sáng tạo xuất sắc của bạn ${studentName}! Cách con tô điểm mảng khối hài hòa, màu sắc ấm áp ngập tràn ánh nắng ban mai. Cố gắng phát huy tài năng thiên bẩm này mỗi ngày con nhé! 🌟🎨`,
        ];
        const fallbackMsg = compliments[Math.floor(Math.random() * compliments.length)];
        return res.json({ result: fallbackMsg });
      }
    } catch (error: any) {
      console.error("AI Evaluation error:", error);
      res.status(500).json({ error: "Có lỗi xảy ra khi xử lý phản hồi từ giáo viên AI." });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Vite middleware setup for development, or serve built assets in production
  if (process.env.NODE_ENV !== "production") {
    // Lazy loaded to prevent errors in production build where vite is devDependency
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback handling
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operational on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal: failed to start the server", err);
});
