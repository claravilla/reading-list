import { App } from "aws-cdk-lib";
import ReadingServiceStack from "./ReadingServiceStack";

const environment = {
  account: process.env.ACCOUNT,
  region: process.env.REGION,
};

const app = new App();
new  ReadingServiceStack
(app, "ReadingServiceStack", {
  env: environment,
});
