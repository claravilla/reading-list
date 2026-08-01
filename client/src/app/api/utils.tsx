import { cookies } from "next/headers";

export const buildAuthHeader = async (): Promise<string> => {
  const token = await extractIdToken();
  return `Bearer ${token}`;
};

export const extractIdToken = async (): Promise<string> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("readingId");
  if (!token) {
    throw new Error("Access token is missing from cookies");
  }
  return token.value;
};

export const extractAccessToken = async (): Promise<string> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("readingAccess");
  if (!token) {
    throw new Error("Access token is missing from cookies");
  }
  return token.value;
};
