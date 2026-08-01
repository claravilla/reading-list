"use server";
import axios from "axios";
import { buildAuthHeader, extractIdToken } from "./utils";

type textExtractEntry = {
  title: string;
  author: string;
};

type ClientCreateEntryData = {
  title: string;
  author: string;
  userId: string;
};

type ServerCreateEntryData = {
  title: string;
  author: string;
};

export const createEntry = async (
  entry: ClientCreateEntryData,
): Promise<any | { message: string }> => {
  const { userId, author, title } = entry;
  const payload: ServerCreateEntryData = {
    author: author,
    title: title,
  };
  const url = process.env.NEXT_PUBLIC_READING_LIST_API_URL || "";
  const apiKey = process.env.NEXT_PUBLIC_READING_LIST_API_KEY || "";

  try {
    const header = await buildAuthHeader();
    const result = await axios.post(`${url}/${userId}`, payload, {
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        Authorization: header,
      },
    });
    return result.data;
  } catch (error) {
    let message = "Could not create new entry";
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message;
    }
    return { message: `Could not create new entry: ${message}` };
  }
};

export const textExtract = async (
  image: File,
  type: string,
): Promise<textExtractEntry> => {
  const url = process.env.NEXT_PUBLIC_TEXT_EXTRACT_API_URL || "";
  const apiKey = process.env.NEXT_PUBLIC_TEXT_EXTRACT_API_KEY || "";

  // Axios error handled by the "extractPicture" function
  const header = await buildAuthHeader();
  const result = await axios.post(url, image, {
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": type,
      Authorization: header,
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
