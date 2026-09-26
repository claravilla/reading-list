"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CTALink from "../../component/ctaLink";
import classes from "./userId.module.css";
import { logoutUser } from "../api/access-page";
import { getAllUserEntries } from "../api/user-page";
import ReadingList from "@/src/component/readingList";
import { ReadingEntryType } from "@/src/types";
import { PacmanLoader } from "react-spinners";

export default function UserHomePage() {
  const { userId } = useParams<{ userId: string }>();
  const displayId = userId.split("-")[0];
  const router = useRouter();
  const [errMessage, setErrMessage] = useState<string>("");
  const [entries, setEntries] = useState<ReadingEntryType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getAllUserEntries(userId)
      .then((data) => {
        setEntries(data);
        setIsLoading(false);
        console.log(data);
      })
      .catch((error) => {
        setErrMessage(error.message);
        setIsLoading(false);
      });
  }, []);

  const ctaClass =
    entries.length != 0 ? "cta-btn-section-left" : "cta-btn-section-center";

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      setErrMessage("Could not log out");
    }
  };
  return (
    <>
      <div className={classes["header-section"]}>
        <h1 className={classes["header-section-element-one"]}>
          WELCOME {displayId}
        </h1>
        <button className="btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
      {isLoading && <PacmanLoader color="#5df8d8" />}
      {!isLoading && (
        <div>
          {entries.length != 0 && errMessage === "" && (
            <div>
              <div className={classes[ctaClass]}>
                <CTALink link={`/add/${userId}`} text="Add Entry" />
              </div>
              <ReadingList entries={entries} />
            </div>
          )}
          {entries.length === 0 && errMessage === "" && (
            <h2 className={classes["h2-align"]}>
              Your list is empty, start adding!
            </h2>
          )}
          {errMessage != "" ? (
            <div className="error-message">{errMessage}</div>
          ) : null}
        </div>
      )}
    </>
  );
}
