import { App } from "aws-cdk-lib";
import ReadingServiceStack from "./ReadingServiceStack";
import TextExtactServiceStack from "./TextExtractServiceStack";
import CognitoStack from "./CognitoStack";

const environment = {
  account: process.env.ACCOUNT,
  region: process.env.REGION,
};

const app = new App();

new CognitoStack(app, "CognitoStack", {
  env: environment
})
new ReadingServiceStack(app, "ReadingServiceStack", {
  env: environment,
});

new TextExtactServiceStack(app, "TextExtractServiceStack", {
  env: environment,
});
