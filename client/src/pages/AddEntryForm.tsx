import React from "react";
import { useState } from "react";

function AddEntryForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [imageToUpload, setImageToUpload] = useState("");

  const handleInputChange = (event: any) => {
    if (event.target.id === "title") {
      setTitle(event.target.value);
    }
    if (event.target.id === "author") {
      setAuthor(event.target.value);
    }

    if (event.target.id === "") setImageToUpload(event.target.files[0]);
  };
 
  return (
    <>
      <div className="add-entry-form">
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
        <h3>Upload a File</h3>
        <input
          type="file"  accept="image/*;capture=camera"
          id="imageToUpload"
          name="imageToUpload"
          value={imageToUpload}
          onChange={handleInputChange}
        />
        <button>Add Entry</button>
      </div>
    </>
  );
}

export default AddEntryForm;
