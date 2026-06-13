"use client";
import { useState, useTransition } from "react";
import { PacmanLoader } from "react-spinners";
import { createEntry, extractPicture } from "../api";
import ImageSelector from "@/src/component/imageSelector";

export default function AddEntryForm() {
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [imageToUpload, setImageToUpload] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>("");
  const [isPending, startTransitionForImage] = useTransition();

  const handleImageSelector = (file: File)=>{
    setImageToUpload(file)
  }

  const handleInputChange = (event: any) => {
    if (event.target.id === "title") {
      setTitle(event.target.value);
    }

    if (event.target.id === "author") {
      setAuthor(event.target.value);
    }

    if (event.target.id === "imageToUpload") {
      setImageToUpload(event.target.files[0]);
    }
  };

  const handleImageSubmission = () => {
    startTransitionForImage(async () => {
      if (imageToUpload === null) {
        return;
      }
      setIsLoading(true);
      const results = await extractPicture(imageToUpload);
      if ("message" in results) {
        setErrMsg(results.message);
        setIsError(true);
        setImageToUpload(null);
        setIsLoading(false);
      } else {
        setAuthor(results.author);
        setTitle(results.title);
        setIsLoading(false);
        setImageToUpload(null);
      }
    });
  };

  if (!isLoading) {
    return (
      <>
        <div className="add-entry-page">
          <div>
            <h3>Upload</h3>
            {imageToUpload === null ? (
              <ImageSelector onInputChange={handleImageSelector} />
            ) : (
              <button
                className="form-button"
                onClick={handleImageSubmission}
                disabled={isPending}
              >
                Process Image
              </button>
            )}
          </div>
          <div className="add-entry-form">
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

            <button className="form-button" onClick={createEntry}>
              Add Entry
            </button>
          </div>
          {isError ? <div className="error-message">{errMsg}</div> : null}
        </div>
      </>
    );
  } else {
    return <PacmanLoader color="#5df8d8"></PacmanLoader>;
  }
}
