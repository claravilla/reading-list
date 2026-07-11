"use server";
import {
  AdminConfirmSignUpCommand,
  AdminConfirmSignUpCommandInput,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  SignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto"; 

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
  await client.send(command);
  console.log("User created")
  await verifyUser(email);
  return await signInUser(email, password);
};

export const signInUser = async (email: string, password: string) => {
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
  const response = await client.send(command);
  const result = response.AuthenticationResult;
  if (!result) {
    throw new Error("Sign in failed");
  }
  const { IdToken: token } = result;
  if (!token) {
    throw new Error("Sign in failed");
  }
  console.log("User logged in")
  const tokenClaims = token.split(".")[1];
  const jsonClaims = Buffer.from(tokenClaims, "base64url").toString("utf8");
  const claims = JSON.parse(jsonClaims);
  const { sub: userId } = claims;

  return userId;
};

const verifyUser = async (username: string) => {
  const input: AdminConfirmSignUpCommandInput = {
    UserPoolId: process.env.NEXY_PUBLIC_USER_POOL_ID,
    Username: username,
  };
  const command = new AdminConfirmSignUpCommand(input);

  await client.send(command);
  console.log("User verified")
  return;
};
