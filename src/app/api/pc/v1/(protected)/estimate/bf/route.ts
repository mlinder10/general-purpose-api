import { LLM, stripAndParse, Gemini } from "@/ai";

export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const image = body.get("image") as File;
    if (!image) return new Response("No image", { status: 400 });
    if (image.type !== "image/jpeg")
      return new Response("Invalid mime type, must be image/jpeg", {
        status: 400,
      });

    const imageBlob = await image.arrayBuffer();
    const imageData = new Uint8Array(imageBlob);

    const llm = new Gemini();
    const result = await estimateBf(llm, imageData);

    if (!result.success)
      return new Response(JSON.stringify(result.error), { status: 400 });

    return new Response(JSON.stringify(result.data), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

type BodyFatResponse =
  | {
      success: true;
      data: { bodyFat: number };
    }
  | {
      success: false;
      error: string;
    };

async function estimateBf(llm: LLM, imgBytes: Uint8Array) {
  const prompt = `
    You are an expert body building coach who can estimate the body fat percentage of a person based on an image of the person.
    If the image is not a person, or you cannot give an accurate estimate, respond with an error.
    Please respond in the following JSON format:

    {
      "success": true,
      "data": {
        "bodyFat": <body fat percentage, ex. 20> (number)
      }
    }

    OR:

    {
      "success": false,
      "error": <reason image could not be parsed, ex. "Image too small"> (string)
    }

    Here is the image of the person:
  `;

  const result = await llm.prompt([
    { type: "text", content: prompt },
    { type: "image", mimeType: "image/jpeg", content: imgBytes },
  ]);

  const bodyFat = stripAndParse<BodyFatResponse>(result);
  if (!bodyFat)
    throw new Error(
      "Failed to parse response from LLM <estimateBf>: " + result
    );

  return bodyFat;
}
