import { LLM, stripAndParse } from "@/llm";
import Gemini from "@/llm/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const image = body.get("meal") as File;
    if (!image) return new Response("No image", { status: 400 });
    if (image.type !== "image/jpeg")
      return new Response("Invalid mime type, must be image/jpeg", {
        status: 400,
      });

    const imageBlob = await image.arrayBuffer();
    const imageData = new Uint8Array(imageBlob);

    const llm = new Gemini();
    const meal = await estimateMeal(llm, imageData);

    return new Response(JSON.stringify(meal), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

type MealData = {
  ingredients: {
    name: string;
    servings: number;
    macros: {
      servingSize: number;
      unit: string;
      calories: number;
      fat: number;
      carbs: number;
      protein: number;
    };
  }[];
};

async function estimateMeal(llm: LLM, imgBytes: Uint8Array) {
  const prompt = `
    You are an expert chef who can estimate the ingredients and nutritional value of a meal based on an image of the food.
    Please respond in the following JSON format:

    {
      "ingredients": [
        {
          "name": <ingredient name, ex. Chicken Breast> (string),
          "servings": <servings in meal, ex. 2.5> (number),
          "macros": {
            "servingSize": <serving size, ex. 4> (number),
            "unit": <serving units, ex. oz> (string),
            "calories": <calories per serving, ex. 120> (number),
            "fat": <grams of fat per serving, ex. 1> (number),
            "carbs": <grams of carbs per serving, ex. 0> (number),
            "protein": <grams of protein per serving, ex. 28> (number)
          }
        }
      ]
    }

    Here is the image of the meal:
  `;

  const result = await llm.prompt([
    { type: "text", content: prompt },
    { type: "image", mimeType: "image/jpeg", content: imgBytes },
  ]);

  const meal = stripAndParse<MealData>(result);
  if (meal === null)
    throw new Error(`Failed to parse llm output <estimateMeal>: ${result}`);

  return meal;
}
