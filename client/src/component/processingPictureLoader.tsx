import { PacmanLoader } from "react-spinners";
import classes from "./image-selector.module.css";

export default function ProcessingPictureLoader() {
  return (
    <>
      <p className={classes["loader-text"]}>
        We are currently processing your picture ...
      </p>
      <PacmanLoader color="#5df8d8"></PacmanLoader>
    </>
  );
}
