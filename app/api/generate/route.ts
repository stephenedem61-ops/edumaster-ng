import OpenAI from "openai";
import { z } from "zod";
import { NextResponse } from "next/server";

const requestSchema = z.object({
  kind: z.enum(["lesson", "exam", "marking"]),
  schoolName: z.string().max(150).optional(),
  teacherName: z.string().max(100).optional(),
  lessonDate: z.string().max(20).optional(),
  subject: z.string().min(1).max(100),
  level: z.string().min(1).max(50),
  term: z.string().min(1).max(30),
  topic: z.string().min(1).max(300),
  subTopic: z.string().max(300).optional(),
  week: z.string().max(20).optional(),
  duration: z.string().max(40).optional(),
  previousKnowledge: z.string().max(1000).optional(),
  materials: z.string().max(1000).optional(),
  count: z.string().max(3).optional(),
  questionType: z.string().max(80).optional(),
  difficulty: z.string().max(40).optional(),
  totalMarks: z.string().max(10).optional(),
  instructions: z.string().max(2000).optional()
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please provide valid document details." }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI generation is not configured yet. The administrator must add the server-side API key." }, { status: 503 });
  }

  const data = parsed.data;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const task = data.kind === "lesson"
    ? [
        "Prepare a complete, professional Nigerian school lesson note in British English.",
        "Use these headings in this order, and do not omit any: SCHOOL; TEACHER; DATE; SUBJECT; CLASS; TERM; WEEK; TOPIC; SUB-TOPIC; DURATION; BEHAVIOURAL OBJECTIVES; ENTRY BEHAVIOUR / PREVIOUS KNOWLEDGE; INSTRUCTIONAL MATERIALS; REFERENCES; SCRIPTURAL RELEVANCE (only when genuinely relevant, otherwise state Not applicable); INTRODUCTION; LESSON PRESENTATION; TEACHER'S ACTIVITIES; LEARNERS' ACTIVITIES; EVALUATION; SUMMARY; CONCLUSION; ASSIGNMENT.",
        "Write 3 to 5 measurable behavioural objectives using observable verbs and appropriate to the stated age and class.",
        "For lesson presentation, use a clear numbered sequence of teaching steps. For each step, explain the content and distinguish the teacher's activities from the learners' activities. Avoid vague statements such as 'teacher teaches'.",
        "Make the note practical for a Nigerian classroom and suitable for the stated subject, class, topic, and duration. Include realistic examples and learner participation.",
        "Use only references that can be identified from the supplied information. Do not invent textbook titles, authors, page numbers, curriculum codes, or official syllabus claims. If no reference is supplied, recommend that the teacher insert the approved textbook or current syllabus rather than fabricating a citation.",
        "Do not force religious content into a lesson. Include a short, appropriate Bible reference only where the subject or topic genuinely supports it; otherwise mark it Not applicable.",
        "End with a short teacher-review note identifying any curriculum details that need checking."
      ].join("\n")
    : data.kind === "exam"
      ? "Create original assessment questions, not copied past questions. Include clear instructions, balanced coverage, appropriate difficulty, and a separate answer key. Make the questions suitable for the stated Nigerian class level."
      : "Prepare a marking scheme with model answers, clear mark allocations, acceptable alternatives, and a total that matches the requested marks.";

  const context = [
    `School: ${data.schoolName || "Not supplied"}; Teacher: ${data.teacherName || "Not supplied"}; Date: ${data.lessonDate || "Not supplied"}.`,
    `Subject: ${data.subject}; Class: ${data.level}; Term: ${data.term}; Week: ${data.week || "Not specified"}.`,
    `Topic: ${data.topic}; Sub-topic: ${data.subTopic || "Not specified"}; Duration: ${data.duration || "Not specified"}.`,
    `Previous knowledge / entry behaviour supplied by teacher: ${data.previousKnowledge || "Not supplied; suggest a brief, realistic entry behaviour."}`,
    `Instructional materials supplied by teacher: ${data.materials || "Not supplied; suggest accessible, low-cost materials where appropriate."}`,
    `Question count: ${data.count || "Not applicable"}; Format: ${data.questionType || "Not applicable"}; Difficulty: ${data.difficulty || "Not applicable"}; Total marks: ${data.totalMarks || "Not specified"}.`,
    `Additional teacher instructions: ${data.instructions || "None"}.`,
    "Do not claim official NERDC, WAEC, NECO, or JAMB endorsement. Flag assumptions and keep the result editable."
  ].join("\n");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: "You are an experienced Nigerian teacher-educator who prepares accurate, age-appropriate teaching documents. Never fabricate sources or official curriculum references. The teacher must review every generated draft." },
        { role: "user", content: `${task}\n\nCONTEXT\n${context}` }
      ]
    });
    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return NextResponse.json({ error: "The service returned an empty document. Please try again." }, { status: 502 });
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "The document could not be generated. Please check the service configuration and try again." }, { status: 502 });
  }
}
