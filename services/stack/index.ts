import { App } from "aws-cdk-lib";
import ReadingEntriesStack from "./ReadingEntriesStack";

const environment = {
  account: process.env.ACCOUNT,
  region: process.env.REGION,
};

const app = new App();
new  ReadingEntriesStack
(app, "ReadingEntriesStack", {
  env: environment,
});
