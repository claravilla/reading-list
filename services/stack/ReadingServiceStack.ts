import {
  App,
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  AccountRecovery,
  ClientAttributes,
  StringAttribute,
  UserPool,
  UserPoolEmail,
} from "aws-cdk-lib/aws-cognito";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export default class ReadingServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const userServiceEmail = process.env.USER_SERVICE_EMAIL;
    if (!userServiceEmail) {
      throw new Error("User service email for Cognito User Pool missing");
    }

    const userPool = new UserPool(this, "readersUserPool", {
      userPoolName: "Readers User Pool",
      signInPolicy: {
        allowedFirstAuthFactors: { password: true },
      },
      signInAliases: {
        email: true,
        username: false,
      },
      selfSignUpEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(1),
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      email: UserPoolEmail.withSES({
        fromEmail: userServiceEmail,
        fromName: "Reading List",
      }),
      keepOriginal: {
        email: true,
      },
      customAttributes: {
        name: new StringAttribute({ mutable: true }),
      },
    });

    const clientWriteAttributes = new ClientAttributes().withStandardAttributes(
      { email: true },
    );

    const clientReadAttributes = clientWriteAttributes.withStandardAttributes({
      email: true,
    });

    const readingAppUser = userPool.addClient("reading-list-app-client", {
      userPoolClientName: "reading-list-app-client",
      generateSecret: true,
      enableTokenRevocation: true,
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
      authFlows: { userPassword: true },
    });

    // const lambda = new NodejsFunction(this, "readingServiceHandler", {
    //   functionName: "reading-service-handler",
    //   runtime: Runtime.NODEJS_22_X,
    //   timeout: Duration.seconds(10),
    //   entry: path.join(__dirname, "../src/handler.ts"),
    // });

    // const apiIntegration = new HttpLambdaIntegration("apiIntegration", lambda);

    // const apiList = new HttpApi(this, "readingListApi");

    // apiList.addRoutes({
    //   path: "/",
    //   methods: [HttpMethod.GET],
    //   integration: apiIntegration,
    // });

    // apiList.addRoutes({
    //   path: "/{username}",
    //   methods: [HttpMethod.GET],
    //   integration: apiIntegration,
    // });

    // apiList.addRoutes({
    //   path: "/{username}",
    //   methods: [HttpMethod.POST],
    //   integration: apiIntegration,
    // });

    // new CfnOutput(this, "readingStackApiURL", {
    //   value: apiList.url as string,
    // });
  }
}
