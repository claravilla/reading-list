"use server";
import {
  AdminConfirmSignUpCommand,
  AdminConfirmSignUpCommandInput,
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
  GlobalSignOutCommandInput,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  SignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { cookies } from "next/headers";
import crypto from "crypto";
import { extractAccessToken, extractIdToken } from "./utils";

const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Missing Cognito Credentials");
}

const client = new CognitoIdentityProviderClient({});

export const createUser = async (email: string, password: string) => {
  const message = email + clientId;
  const secretHash = crypto
    .createHmac("SHA256", clientSecret)
    .update(message)
    .digest("base64");
  const input: SignUpCommandInput = {
    ClientId: clientId,
    SecretHash: secretHash,
    Username: email,
    Password: password,
  };
  const command = new SignUpCommand(input);
  try {
    await client.send(command);
    console.log("User created");
    await verifyUser(email);
    return await signInUser(email, password);
  } catch (error) {
    throw new Error(`Could not create user ${error}`);
  }
};

export const signInUser = async (email: string, password: string) => {
  const cookieStore = await cookies();
  const message = email + clientId;
  const secretHash = crypto
    .createHmac("SHA256", clientSecret)
    .update(message)
    .digest("base64");
  const input: InitiateAuthCommandInput = {
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      PASSWORD: password,
      SECRET_HASH: secretHash,
      USERNAME: email,
    },
    ClientId: clientId,
  };
  const command = new InitiateAuthCommand(input);
  try {
    const response = await client.send(command);
    const result = response.AuthenticationResult;
    if (!result) {
      throw new Error("Sign in failed");
    }
    const { IdToken: idToken, AccessToken: accessToken } = result;
    if (!idToken || !accessToken) {
      throw new Error("Sign in failed");
    }

    console.log("User logged in");
    const tokenClaims = idToken.split(".")[1];
    const jsonClaims = Buffer.from(tokenClaims, "base64url").toString("utf8");
    const claims = JSON.parse(jsonClaims);
    const { sub: userId } = claims;

    cookieStore.set({
      name: "readingAccess",
      value: accessToken,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Date.now() + 60 * 60 * 24, // Expires in 24 hours
    });

    cookieStore.set({
      name: "readingId",
      value: idToken,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Date.now() + 60 * 60 * 24, // Expires in 24 hours
    });

    return userId;
  } catch (error) {
    throw new Error(`Could not sign in user ${error}`);
  }
};

const verifyUser = async (username: string) => {
  const input: AdminConfirmSignUpCommandInput = {
    UserPoolId: process.env.NEXY_PUBLIC_USER_POOL_ID,
    Username: username,
  };
  const command = new AdminConfirmSignUpCommand(input);

  try {
    await client.send(command);
    console.log("User verified");
    return;
  } catch (error) {
    throw new Error(`Could not verify user ${error}`);
  }
};

export const logoutUser = async () => {
  const token = await extractAccessToken();
  const cookieStore = await cookies();

  const input: GlobalSignOutCommandInput = {
    AccessToken: token,
  };
  const command = new GlobalSignOutCommand(input);

  try {
    await client.send(command);
    cookieStore.delete("readingAccess");
    cookieStore.delete("readingAId");
    return;
  } catch (error) {
    console.log();
    throw new Error(`Could not log out user ${error}`);
  }
};
