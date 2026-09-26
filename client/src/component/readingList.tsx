import { ReadingEntryType } from "../types";
import ReadingEntry from "./readingEntry";
import classes from "./css/reading-list.module.css";

export default function ReadingList(props: { entries: ReadingEntryType[] }) {
  return (
    <div className={classes["reading-list"]}>
      {props.entries.map((entry) => {
        return <ReadingEntry key={entry.id} entry={entry} />;
      })}
      ;
    </div>
  );
}
