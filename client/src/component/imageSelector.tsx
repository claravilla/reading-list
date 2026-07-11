"use client";
import { useRef, useState } from "react";
import { Camera, CornerUpLeft, Paperclip } from "lucide-react";
import ProcessingPictureLoader from "./processingPictureLoader";
import { extractPicture } from "../app/api/add-page";
import classes from "./css/image-selector.module.css";

export default function ImageSelector({
  onInputChange,
  onResult,
}: {
  onInputChange: any;
  onResult: any;
}) {
  const [showCamera, setShowCamera] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
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
        setShowCamera(false);
        handlePictureSelected(file);
        // stop camera stream
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    }, "image/jpeg");
  };

  const handleFilePickerOnChange = (event: any) => {
    handlePictureSelected(event.target.files[0]);
  };

  const handlePictureSelected = (file: File) => {
    onInputChange(file);
    setIsImageLoading(true);
    handleImageSubmission(file);
  };

  const handleImageSubmission = async (file: File) => {
    try {
      const results = await extractPicture(file);
      onResult(results);
    } catch (err) {
      onResult({ message: err });
    } finally {
      setIsImageLoading(false);
    }
  };

  if (!isImageLoading) {
    return (
      <>
        {showCamera ? (
          <div className={classes["take-picture-section"]}>
            <video
              ref={videoRef}
              className={classes["camera-screen-section"]}
              autoPlay
              playsInline
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div className={classes["add-picture-buttons-section"]}>
              <button
                className={classes["camera-form-button"]}
                onClick={takePhoto}
              ></button>
              <button
                className={classes["camera-form-button"]}
                onClick={() => setShowCamera(false)}
              >
                <CornerUpLeft />
              </button>
            </div>
          </div>
        ) : (
          <div className={classes["add-picture-buttons-section"]}>
            <div className={classes["file-picker"]}>
              <button className={classes["icon-btn"]} onClick={startCamera}>
                <Camera size={59} color="white" />
              </button>
            </div>
            <label className={`${classes["file-picker"]} ${classes["margin-left"]}`}>
              <div className={classes["icon-btn"]}>
                <Paperclip size={60} color="white" />
              </div>
              <input
                className={classes["hidden"]}
                type="file"
                accept="image/*"
                id="imageToUpload"
                name="imageToUpload"
                onChange={handleFilePickerOnChange}
              />
            </label>
          </div>
        )}
      </>
    );
  } else {
    return <ProcessingPictureLoader />;
  }
}
