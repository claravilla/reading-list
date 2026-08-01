"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import CTALink from "../../component/ctaLink";
import classes from "./userId.module.css";
import { logoutUser } from "../api/access-page";

export default function UserHomePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [message, setMessage] = useState<string>("");

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      setMessage("Could not log out");
    }
  };
  return (
    <>
      <h1>WELCOME {userId}</h1>
      <button className="btn" onClick={handleLogout}>
        Log out
      </button>
      <div className={classes["cta-btn-section"]}>
        <CTALink link={`/add/${userId}`} text="Add Entry" />
      </div>
      {message != "" ? <div className="error-message">{message}</div> : null}
    </>
  );
}
