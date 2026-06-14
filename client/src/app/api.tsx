"use server";
import axios from "axios";

type CreateEntryData = {
  title: string;
  author: string;
};

export const createEntry = async () => {
  //   setIsLoading(true);
  //   const payload: CreateEntryData = {
  //     author: author,
  //     title: title,
  //   };

  // const result = await

  // set is loading false
  //redirect to home page

  // return error--> entry cannot be created

  return true;
};

export const textExtract = async (
  image: File,
  type: string,
): Promise<CreateEntryData> => {
  const url = process.env.NEXT_PUBLIC_TEXT_EXTRACT_URL || "";
  const apiKey = process.env.NEXT_PUBLIC_TEXT_EXTRACT_API_KEY || "";

  // Axios error handled by the "extractPicture" function
  const result = await axios.post(url, image, {
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": type,
    },
  });
  return result.data;
};

export const extractPicture = async (
  image: File,
): Promise<{ author: string; title: string } | { message: string }> => {
  try {
    const result = await textExtract(image, image.type);
    const { author, title } = result;
    return {
      author,
      title,
    };
  } catch (error) {
    let message = "Could not process your picture";
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message;
    }
    return { message: `Could not process your picture: ${message}` };
  }
};
