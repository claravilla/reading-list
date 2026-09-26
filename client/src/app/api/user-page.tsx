"use server";
import axios from "axios";
import { buildAuthHeader } from "./utils";
import {
  ClientCreateEntryDataType,
  ServerCreateEntryDataType,
  textExtractEntryType,
} from "@/src/types";

// CREATE NEW ENTRY

export const createEntry = async (
  entry: ClientCreateEntryDataType,
): Promise<any | { message: string }> => {
  const { userId, author, title } = entry;
  const payload: ServerCreateEntryDataType = {
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
): Promise<textExtractEntryType> => {
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

export const getAllUserEntries = async (userId: string) => {
  const url = process.env.NEXT_PUBLIC_READING_LIST_API_URL || "";
  const apiKey = process.env.NEXT_PUBLIC_READING_LIST_API_KEY || "";

  try {
    const header = await buildAuthHeader();
    const result = await axios.get(`${url}/${userId}`, {
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        Authorization: header,
      },
    });
    console.log("DATA", result.data)
    return result.data;
  } catch (error) {
    let message = "Could not get reading list";
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message;
    }
    throw new Error(`Could not get reading list: ${message}`);
  }
};
