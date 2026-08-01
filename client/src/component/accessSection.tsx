"use client";

import { useState } from "react";
import SignUpForm from "./signUpForm";
import SignInForm from "./signInForm";
import classes from "./css/access-section.module.css";
import css from "../app/globals.css";

export default function AccessSection() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isSignIn, setIsSignIn] = useState<boolean>(false);

  const handleSubmission = async (event: any) => {
    if (event.target.id === "signUp") {
      setIsSignUp(true);
    } else {
      setIsSignIn(true);
    }
  };

  if (isSignIn) {
    return <SignInForm onCancelFunction={() => setIsSignIn(false)} />;
  }

  if (isSignUp) {
    return <SignUpForm onCancelFunction={() => setIsSignUp(false)} />;
  }

  return (
    <div className={classes["access-btn-section"]}>
      <button id="signUp" className="btn" onClick={handleSubmission}>
        Sign up
      </button>
      <button id="signIn" className="btn" onClick={handleSubmission}>
        Sign In
      </button>
    </div>
  );
}
