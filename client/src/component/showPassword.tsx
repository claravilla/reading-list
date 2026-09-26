import { Dispatch, SetStateAction } from "react";
import classes from "./css/access-section.module.css";
export default function ShowPassword({
  onCheckbox,
}: {
  onCheckbox: Dispatch<SetStateAction<string>>;
}) {
  const handleShowPassword = async (event: any) => {
    console.log(event.target.checked);
    if (event.target.checked) {
      onCheckbox("text");
    } else {
      onCheckbox("password");
    }
  };

  return (
    <div className={classes["show-password"]}>
      <label>Show Password</label>
      <input
        type="checkbox"
        onChange={handleShowPassword}
        className={classes["checkbox"]}
      />
    </div>
  );
}
