import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, length } = await req.json();

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com",
          "X-Title": "chainfundit-campaign",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: `You generate fundraising campaign descriptions.
                        Rules:
                        - Output ONLY the campaign description
                        - Plain text only
                        - No title
                        - No headings
                        - No quotes
                        - No explanations
                        - No emojis
                        - No extra lines before or after the description`,
            },
            {
              role: "user",
              content: `Write a ${length} fundraising campaign description based on this prompt: ${prompt}. Begin output immediately.`,
            },
          ],
          temperature: 0.6,
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ OpenRouter error:", err);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}
