"use-client";
import { useRef, useState } from "react";
import { Camera, CornerUpLeft, Paperclip } from "lucide-react";

export default function ImageSelector({
  onInputChange,
}: {
  onInputChange: any;
}) {
  const [showCamera, setShowCamera] = useState(false);
  //   const [imgeToUpload, setImageToUpload] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInputChange = (event: any) => {
    onInputChange(event.target.files[0]);
  };

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
        onInputChange(file);
        setShowCamera(false);
        // stop camera stream
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    }, "image/jpeg");
  };

  return (
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
            <button className="camera-form-button" onClick={takePhoto}></button>
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
  );
}
