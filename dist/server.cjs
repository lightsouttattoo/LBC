var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/pastor-chat", async (req, res) => {
    const { pastorName, pastorRole, shiftName, userMessage, conversationHistory } = req.body;
    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Message content is required" });
    }
    const name = pastorName || "Pastor David Evans";
    const role = pastorRole || "Senior Pastor, Lights Out Baptist Church";
    const shift = shiftName || "Morning Shift";
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        const ai = new import_genai.GoogleGenAI({ apiKey });
        const systemInstruction = `You are ${name}, ${role}. You are currently on duty on the ${shift} as a dedicated Virtual Faith Assistant at Lights Out Baptist Church.

Your identity, theology & tone:
1. You are a warm, compassionate, authentic Baptist pastor. Speak naturally as a real minister in direct message fellowship.
2. Standard of Scripture: You strictly quote, cite, and reference the King James Version (KJV) Holy Bible.
3. Baptist Doctrine: You hold firmly to salvation by grace through faith in Jesus Christ (Ephesians 2:8-9), the authority of God's Word, baptism by immersion, the security of the believer, and the power of prayer.
4. Pastoral Counsel & Questions: When asked a direct question about Scripture (such as "Do you know James Chapter 2?"), answer directly with deep biblical wisdom, citing exact key KJV verses (e.g. James 2:14-26 on faith and works, respect of persons in James 2:1-9) and explaining their true spiritual meaning.
5. Pastoral Prayer: When a user asks for prayer or shares a personal burden, include a fervent, heartfelt Baptist prayer ending in "In Jesus' Holy Name, Amen."
6. Style: Conversational, personal, dignified, encouraging, and deeply pastor-like. Never refer to yourself as an artificial intelligence or language model; act as a genuine, caring shepherd of souls.
7. Keep response lengths balanced for chat (typically 2 to 4 paragraphs or message + prayer).`;
        let formattedPrompt = `User's message: "${userMessage}"`;
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          const recent = conversationHistory.slice(-8).map(
            (msg) => `${msg.isUser ? "Believer" : name}: ${msg.content}`
          ).join("\n");
          formattedPrompt = `Recent message history:
${recent}

User's latest message: "${userMessage}"

Please answer user's message thoughtfully as ${name}:`;
        }
        const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        for (const modelName of modelsToTry) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: formattedPrompt,
              config: {
                systemInstruction,
                temperature: 0.7
              }
            });
            if (response.text) {
              return res.json({ reply: response.text });
            }
          } catch (mErr) {
            console.warn(`Model ${modelName} failed, trying next model...`);
          }
        }
      } catch (err) {
        console.error("Gemini API call error:", err);
      }
    }
    const mockPastor = {
      id: "pastor",
      name,
      role,
      church: "Lights Out Baptist Church",
      shiftName: shift,
      shiftHours: "24/7",
      avatar: "",
      bio: "",
      specialty: "KJV Doctrine & Prayer",
      favoriteVerse: "John 3:16",
      greetingMessage: `Grace and peace be unto you! I am ${name}, ${role}.`
    };
    const text = userMessage.toLowerCase().trim();
    let reply = `Thank you for reaching out! As ${name}, I am glad to fellowship with you.

Regarding your message: "${userMessage}" \u2014 God's Word tells us in Psalm 119:105, *"Thy word is a lamp unto my feet, and a light unto my path."*

Whatever passage of Scripture or situation you are bringing before the Lord today, I am here to offer biblical counsel, dive deeper into the KJV Bible with you, or pray with you. How can I serve you today?`;
    if (text.includes("james 2") || text.includes("james chapter 2")) {
      reply = `Yes, absolutely! James Chapter 2 (KJV) is one of the most vital chapters in the New Testament on living faith!

Key passages in James 2:
\u2022 **Respect of Persons (James 2:1-9):** James warns: *"My brethren, have not the faith of our Lord Jesus Christ, the Lord of glory, with respect of persons."* True faith treats all believers with equal love, fulfilling the royal law (*"Thou shalt love thy neighbour as thyself"*).
\u2022 **Faith Without Works is Dead (James 2:14-26):** Verse 17 declares: *"Even so faith, if it hath not works, is dead, being alone."* True saving faith in Christ (Ephesians 2:8-9) is not mere mental assent; it produces real spiritual fruit and obedience in our daily lives! James gives the example of Abraham offering Isaac and Rahab receiving the spies. Verse 26 concludes: *"For as the body without the spirit is dead, so faith without works is dead also."*

What specific verse in James 2 would you like to unpack further or pray over together?`;
    } else if (text.includes("james")) {
      reply = `Praise the Lord! The Epistle of James is packed with practical wisdom for the Christian walk.

\u2022 **James 1:** Counting trials as joy (*"the trying of your faith worketh patience"*) and being doers of the Word, not hearers only (v.22).
\u2022 **James 2:** Warning against favoritism and declaring that genuine faith produces godly works (*"faith without works is dead"*).
\u2022 **James 3:** Taming the tongue and pursuing heavenly wisdom (*"pure, peaceable, gentle, and easy to be intreated"*).
\u2022 **James 4:** Submitting to God and resisting the devil (*"Draw nigh to God, and he will draw nigh to you"*).
\u2022 **James 5:** Patience in suffering and the power of prayer (*"The effectual fervent prayer of a righteous man availeth much"*).

Which chapter or topic in James is on your heart today?`;
    } else if (text.includes("john")) {
      reply = `The Gospel of John unveils Jesus Christ as the eternal Son of God!
John 3:16 (KJV): *"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."*
John 14:6: *"Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me."*

How can I encourage your faith in John's Gospel today?`;
    } else if (text.includes("pray") || text.includes("prayer") || text.includes("sick") || text.includes("heal")) {
      reply = `Amen! As ${name}, I stand with you in agreement before the Lord right now.

Let us pray together:
*"Heavenly Father, Almighty God, we come before Thee in the Holy Name of Lord Jesus Christ. Look down in mercy and power upon this precious believer. Lord, Thou knowest every circumstance and burden. Supply grace according to Thy riches in glory, bring divine healing, comfort, and peace that passeth all understanding. In Jesus' Holy Name, Amen."*

How else can I uplift you in prayer today?`;
    } else if (text === "hi" || text === "hello" || text === "hey") {
      reply = `Grace and peace to you! I am ${name}, ${role} at Lights Out Baptist Church.

I am glad to fellowship with you! Whether you have a question about the KJV Bible, need pastoral advice, or want to pray together, I am right here for you. What is on your heart today?`;
    }
    return res.json({ reply });
  });
  const distPath = import_path.default.join(process.cwd(), "dist");
  const hasDist = import_fs.default.existsSync(import_path.default.join(distPath, "index.html"));
  if (process.env.NODE_ENV === "production" && hasDist) {
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  } else {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lights Out Baptist Virtual Faith Assistant Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
