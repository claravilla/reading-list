import React from "react";
import { useState, useRef } from "react";
import axios from "axios";
import { PacmanLoader } from "react-spinners";
import { Camera, CornerUpLeft, Paperclip } from "lucide-react";

function AddEntryForm() {
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [imageToUpload, setImageToUpload] = useState<File | null>(null);
  const [imageType, setImageType] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const takePhoto = () => {
    const canvas = canvasRef.current!;
    const video = videoRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        setImageToUpload(file);
        setImageType("image/jpeg");
        setShowCamera(false);
        // stop camera stream
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    }, "image/jpeg");
  };

  type CreateEntryData = {
    title: string;
    author: string;
  };

  const handleInputChange = (event: any) => {
    if (event.target.id === "title") {
      setTitle(event.target.value);
    }

    if (event.target.id === "author") {
      setAuthor(event.target.value);
    }

    if (event.target.id === "imageToUpload") {
      setImageToUpload(event.target.files[0]);
      setImageType(event.target.files[0].type);
    }
  };

  const extractPicture = async () => {
    setIsLoading(true);
    try {
      const result = await textExtract();
      const { author, title } = result;
      setAuthor(author);
      setTitle(title);
      setIsLoading(false);
      return;
    } catch (error) {
      setIsError(true);
      let message = "Could not process your picture";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message;
      }
      setErrMsg(`Could not process your picture: ${message}`);
      setImageToUpload(null);
      setImageType("");
      setIsLoading(false);
      return;
    }
  };

  const createEntry = async () => {
    setIsLoading(true);
    const payload: CreateEntryData = {
      author: author,
      title: title,
    };

    // const result = await

    // set is loading false
    //redirect to home page

    // return error--> entry cannot be created

    return true;
  };

  const textExtract = async (): Promise<CreateEntryData> => {
    const url = process.env.REACT_APP_TEXT_EXTRACT_URL || "";
    const apiKey = process.env.REACT_APP_TEXT_EXTRACT_API_KEY || "";

    // Axios error handled by the "extractPicture" function
    const result = await axios.post(url, imageToUpload, {
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": imageType,
      },
    });
    setImageToUpload(null);
    setImageType("");
    return result.data;
  };

  if (!isLoading) {
    return (
      <>
        <div className="add-entry-page">
          <div>
            <h3>Upload</h3>
            {imageToUpload === null ? (
              <>
                {showCamera ? (
                  <div className="take-picture-section">
                    <video
                      ref={videoRef}
                      className="camera-screen-section"
                      autoPlay
                      playsInline
                    />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <div className="add-picture-buttons-section">
                      <button
                        className="camera-form-button"
                        onClick={takePhoto}
                      ></button>
                      <button
                        className="camera-form-button"
                        onClick={() => setShowCamera(false)}
                      >
                        <CornerUpLeft />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="add-picture-buttons-section">
                    <div className="file-picker">
                      <button className="icon-btn" onClick={startCamera}>
                        <Camera size={55} color="white" />
                      </button>
                    </div>
                    <label className="file-picker margin-left">
                      <div className="icon-btn">
                        <Paperclip size={60} color="white" />
                      </div>
                      <input
                        className="hidden"
                        type="file"
                        accept="image/*"
                        id="imageToUpload"
                        name="imageToUpload"
                        onChange={handleInputChange}
                      />
                    </label>
                  </div>
                )}
              </>
            ) : (
              <button className="form-button" onClick={extractPicture}>
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

export default AddEntryForm;
