import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Jimp, JimpMime } from "jimp";

export const handler = async (event: any) => {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: "Body cannot be empty",
    };
  }
  console.log("EVENT", event);

  if (!event.isBase64Encoded) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({
        message: "Event is not base64 encoded and cannot be consumed",
      }),
    };
  }

  const pictureFile = Buffer.from(event.body, "base64");

  if (!pictureFile || pictureFile.length === 0) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: "Picture cannot be empty" }),
    };
  }

  let finalImageBase64 = event.body;

  try {
    const image = await Jimp.read(pictureFile);

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    if (width > 1024 || height > 1024) {
      image.scaleToFit({ w: 1024, h: 1024 });

      const resizedBuffer = await image.getBuffer(JimpMime.jpeg);
      finalImageBase64 = resizedBuffer.toString("base64");
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({
        message: `Could not parse/resize image, ${error}`,
      }),
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const BookInfo = z.object({
    author: z.string().nullable(),
    title: z.string().nullable(),
    message: z.string().nullable(),
  });

  const extractTextInput: OpenAI.Responses.EasyInputMessage = {
    role: "user",
    content: [
      {
        type: "input_text",
        text: "If the image is a book cover, extract Author and Title, return empty string if cannot extract them, set message to null. If the picture is not a book cover, return only message field saying so, set Author and Title null",
      },
      {
        type: "input_image",
        image_url: `data:image/jpeg;base64,${finalImageBase64}`,
        detail: "auto",
      },
    ],
  };

  try {
    const response = await client.responses.parse({
      model: "gpt-4o-mini",
      input: [extractTextInput],
      text: {
        format: zodTextFormat(BookInfo, "book"),
      },
    });

    const parsedResponse = response.output_parsed;

    console.log("RESP", parsedResponse);

    if (!parsedResponse) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Headers":
            "Content-Type,Authorization,X-Api-Key",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        body: JSON.stringify({ message: "Could not parse OpenAi response" }),
      };
    }

    if (parsedResponse.message !== null) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Headers":
            "Content-Type,Authorization,X-Api-Key",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        body: JSON.stringify({ message: "Image provided is not a book cover" }),
      };
    }

    const { message, ...result } = parsedResponse;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.log("ERROR", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: `Could not extract text, ${error}` }),
    };
  }
};
