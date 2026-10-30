import OpenAI from "openai";
import { z } from "zod";
import { NextResponse } from "next/server";

const requestSchema = z.object({
  kind: z.enum(["lesson", "exam", "marking"]),
  subject: z.string().min(1).max(100),
  level: z.string().min(1).max(50),
  term: z.string().min(1).max(30),
  topic: z.string().min(1).max(300),
  week: z.string().max(20).optional(),
  duration: z.string().max(40).optional(),
  count: z.string().max(3).optional(),
  questionType: z.string().max(80).optional(),
  difficulty: z.string().max(40).optional(),
  totalMarks: z.string().max(10).optional(),
  instructions: z.string().max(2000).optional()
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide valid document details." }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI generation is not configured yet. The administrator must add the server-side API key." }, { status: 503 });
  }
  const data = parsed.data;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const task = data.kind === "lesson"
    ? "Write a complete, classroom-ready lesson note with measurable objectives, entry behaviour, instructional materials, relevant scriptural connection only where appropriate, introduction, logically sequenced teacher and learner activities, evaluation, conclusion, and references. Use British English and Nigerian school terminology."
    : data.kind === "exam"
    ? "Create original assessment questions, not copied past questions. Include clear instructions, balanced coverage, appropriate difficulty, and a separate answer key. Make the questions suitable for the stated Nigerian class level."
    : "Prepare a marking scheme with model answers, clear mark allocations, acceptable alternatives, and a total that matches the requested marks.";
  const prompt = [
    task,
    "Context:",
    `Subject: ${data.subject}; Class: ${data.level}; Term: ${data.term}; Topic: ${data.topic}.`,
    `Week: ${data.week || "Not specified"}; Duration: ${data.duration || "Not specified"}.`,
    `Question count: ${data.count || "Not applicable"}; Format: ${data.questionType || "Not applicable"}; Difficulty: ${data.difficulty || "Not applicable"}; Total marks: ${data.totalMarks || "Not specified"}.`,
    `Additional teacher instructions: ${data.instructions || "None"}.`,
    "Do not claim official NERDC, WAEC, NECO, or JAMB endorsement. Flag assumptions and keep the result editable."
  ].join("\n");
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: "You are an experienced Nigerian teacher-educator who prepares accurate, age-appropriate teaching documents. The teacher must review every generated draft." },
        { role: "user", content: prompt }
      ]
    });
    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return NextResponse.json({ error: "The service returned an empty document. Please try again." }, { status: 502 });
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "The document could not be generated. Please check the service configuration and try again." }, { status: 502 });
  }
}
