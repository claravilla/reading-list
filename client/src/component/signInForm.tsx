"use client";
import { MouseEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import { signInUser } from "../app/api/access-page";
import classes from "./css/access-section.module.css";
import { PacmanLoader } from "react-spinners";

export default function SignInForm({
  onCancelFunction,
}: {
  onCancelFunction: MouseEventHandler<HTMLButtonElement>;
}) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (event: any) => {
    if (event.target.id === "email") {
      setEmail(event.target.value);
    }

    if (event.target.id === "password") {
      setPassword(event.target.value);
    }
  };

  const handleOnBlur = (event: any) => {
    if (event.target.id === "email" && email.length === 0) {
      setErrorMsg("Email cannot be empty");
    }
    if (event.target.id === "password" && password.length === 0) {
      setErrorMsg("Password cannot be empty");
    }

    if (email.length > 0 && password.length > 0) {
      setIsDisabled(false);
    }
  };

  const handleSubmission = async () => {
    try {
      const userId = await signInUser(email, password);
      router.push(`/${userId}`);
    } catch (error) {
      setErrorMsg(`Failed to sign in: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isLoading && (
        <div className={classes["form-section"]}>
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            placeholder="Email"
            onChange={handleInputChange}
            onBlur={handleOnBlur}
          ></input>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            placeholder="Password"
            onChange={handleInputChange}
            onBlur={handleOnBlur}
          ></input>
          <div className={classes["btn-section"]}>
            <button
              className={classes["btn"]}
              onClick={handleSubmission}
              disabled={isDisabled}
            >
              Sign in
            </button>
            <button className={classes["btn"]} onClick={onCancelFunction}>
              Cancel
            </button>
          </div>
          {errorMsg !== "" ? <p className="error-message">{errorMsg}</p> : null}
        </div>
      )}
      {isLoading && <PacmanLoader />}
    </>
  );
}
