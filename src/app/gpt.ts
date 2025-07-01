"use server"
import OpenAI from "openai";

const token = process.env.OPENAI_API_KEY;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

export async function main(systemPrompt : string , userQuery : string) {

  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  const response = await client.chat.completions.create({
    messages: [
        { role:"system", content: systemPrompt },
        { role:"user", content: userQuery }
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: model
    });

  console.log(response.choices[0].message.content);
  return {
    message : response.choices[0].message.content,
  };
}