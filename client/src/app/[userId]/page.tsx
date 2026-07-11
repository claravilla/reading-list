"use client";
import { useParams } from "next/navigation";
export default function UserHomePage() {
  const { userId } = useParams<{ userId: string }>();
  return <h1>USER PAGE {userId}</h1>;
}
