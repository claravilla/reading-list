"use client";
import { useState } from "react";
import { PacmanLoader } from "react-spinners";
import { createEntry} from "../api";
import ImageSelector from "@/src/component/imageSelector";
import classes from "./add.module.css";

export default function AddEntryForm() {
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [imageToUpload, setImageToUpload] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>("");

  const handleImageSelector = (file: File) => {
    setImageToUpload(file);
  };

  const handleInputChange = (event: any) => {
    if (event.target.id === "title") {
      setTitle(event.target.value);
    }

    if (event.target.id === "author") {
      setAuthor(event.target.value);
    }
  };

  const handlePictureResult = (
    results:
      | {
          author: string;
          title: string;
        }
      | {
          message: string;
        },
  ) => {
    if ("message" in results) {
      setErrMsg(results.message);
      setIsError(true);
      setImageToUpload(null);
      setIsLoading(false);
    } else {
      setAuthor(results.author);
      setTitle(results.title);
      setImageToUpload(null);
      setIsLoading(false);
    }
  };

  if (!isLoading) {
    return (
      <>
        <div className={classes["add-entry-page"]}>
          <div>
            <h3>Upload</h3>
            <ImageSelector
              onInputChange={handleImageSelector}
              onResult={handlePictureResult}
            />
          </div>
          <div className={classes["add-entry-form"]}>
            <h3>Input details</h3>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              placeholder="Title"
              onChange={handleInputChange}
            ></input>
            <input
              type="text"
              id="author"
              name="author"
              value={author}
              placeholder="Author"
              onChange={handleInputChange}
            ></input>

            <button className={classes["form-button"]} onClick={createEntry}>
              Add Entry
            </button>
          </div>
          {isError ? <div className={classes["error-message"]}>{errMsg}</div> : null}
        </div>
      </>
    );
  } else {
    return <PacmanLoader color="#5df8d8"></PacmanLoader>;
  }
}
