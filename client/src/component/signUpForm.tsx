"use client";
import { MouseEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "../app/api/access-page";
import css from "../app/globals.css";
import classes from "./css/access-section.module.css";
import { PacmanLoader } from "react-spinners";

export default function SignUpForm({
  onCancelFunction,
}: {
  onCancelFunction: MouseEventHandler<HTMLButtonElement>;
}) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
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

    if (event.target.id === "confirmPassword") {
      setConfirmPassword(event.target.value);
    }
  };

  const handleInputValidation = (event: any) => {
    if (event.target.id === "email" && email.length === 0) {
      setErrorMsg("Email must not be empty");
    }
    if (event.target.id === "password" && password.length < 12) {
      setErrorMsg("Password must be 12 characters");
    }
  };

  const handleConfirmedPassword = () => {
    if (password.length <12) {
        setErrorMsg("Password must be 12 character long")
        return
    }
    if (password === confirmPassword) {
      setErrorMsg("");
      setIsDisabled(false);
    } else {
      setErrorMsg("Password must match");
    }
  };
  const handleSubmission = async () => {
    try {
      setIsLoading(true);
      const userId = await createUser(email, password);
      router.push(`/${userId}`);
      // redirect to use page
    } catch (error) {
      setErrorMsg(`Sign up failed: ${error}`);
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
            onBlur={handleInputValidation}
          ></input>

          <input
            type="password"
            id="password"
            name="password"
            value={password}
            placeholder="Password"
            onChange={handleInputChange}
            minLength={12}
          ></input>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={handleInputChange}
            onBlur={handleConfirmedPassword}
          ></input>
          <div className={classes["btn-section"]}>
            <button
              className="btn"
              disabled={isDisabled}
              onClick={handleSubmission}
            >
              Submit
            </button>
            <button className="btn" onClick={onCancelFunction}>
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
