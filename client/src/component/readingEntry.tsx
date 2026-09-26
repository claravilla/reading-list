import { ReadingEntryType } from "../types";
import classes from "./css/reading-list.module.css";

export default function ReadingEntry(props: { entry: ReadingEntryType }) {
  const { id, title, author, createdAt, genre, serie, serieNumber } =
    props.entry;

  return (
    <div className={classes["reading-entry"]}>
      <p className={classes["reading-entry-field"]}>{author}</p>
      <p className={classes["reading-entry-field"]}>
        <strong>{title}</strong>
      </p>
      {genre && <p className={classes["reading-entry-field"]}>{...genre}</p>}
      {serie && (
        <p className={classes["reading-entry-field"]}>
          {serie} #{serieNumber}
        </p>
      )}
    </div>
  );
}
