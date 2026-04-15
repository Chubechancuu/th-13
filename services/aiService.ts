import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateRoadmap(year: number, gpa: number, goal: string) {
  const prompt = `Bạn là một chuyên gia tư vấn nghề nghiệp cho sinh viên kinh tế tại Việt Nam. 
  Hãy tạo lộ trình học tập 4 năm cho sinh viên:
  - Năm hiện tại: ${year}
  - GPA hiện tại: ${gpa}
  - Mục tiêu nghề nghiệp: ${goal}
  
  Trả về kết quả dưới dạng JSON array gồm 4 đối tượng (cho 4 năm), mỗi đối tượng có:
  - year: số năm (1-4)
  - skills: mảng các kỹ năng cần học (ví dụ: Excel, SQL, Soft Skills)
  - tasks: mảng các nhiệm vụ cụ thể (ví dụ: Hoàn thành chứng chỉ MOS, Thực tập tại Big4)
  - advice: lời khuyên chiến lược ngắn gọn cho năm đó.
  
  Hãy trả về CHỈ JSON, không có markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return null;
  }
}

export async function getAICoachTip(profile: any) {
  const prompt = `Dựa trên hồ sơ sinh viên: ${JSON.stringify(profile)}. 
  Hãy đưa ra 1 lời khuyên nghề nghiệp ngắn gọn (dưới 30 từ) và truyền cảm hứng cho ngày hôm nay. 
  Trả về text thuần túy.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });
    return response.text || "Hãy luôn nỗ lực vì mục tiêu của bạn!";
  } catch (error) {
    return "Hôm nay là một ngày tuyệt vời để học thêm kỹ năng mới!";
  }
}

export async function generateCVDescription(projectName: string, goal: string) {
  const prompt = `Viết 3 dòng mô tả chuyên nghiệp cho dự án "${projectName}" trong CV của một sinh viên có mục tiêu "${goal}". 
  Sử dụng các động từ mạnh, tập trung vào kết quả. Ngôn ngữ: Tiếng Việt. 
  Trả về text thuần túy, các dòng cách nhau bằng dấu xuống dòng.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
}

export async function suggestProjectSkills(projectName: string, goal: string) {
  const prompt = `Gợi ý 5 kỹ năng chuyên môn liên quan nhất cho dự án "${projectName}" với mục tiêu nghề nghiệp "${goal}". 
  Trả về dưới dạng JSON array các chuỗi (strings). CHỈ JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}
