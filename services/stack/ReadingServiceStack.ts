import {
  App,
  CfnOutput,
  Duration,
  Fn,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  ApiKey,
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import {
  AccountRecovery,
  ClientAttributes,
  StringAttribute,
  UserPool,
  UserPoolEmail,
} from "aws-cdk-lib/aws-cognito";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export default class ReadingServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // IMPORT USER POOL

    const userPoolArn = Fn.importValue("readingListUserPoolArn");

    const userPool = UserPool.fromUserPoolArn(
      this,
      "readingListUserPool",
      userPoolArn,
    );

    // DYNAMO DB

    const table = new Table(this, "readingListTable", {
      tableName: "reading-list-table",
      partitionKey: {
        name: "userId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // LAMBDA HANLDER - One entry point for all routes

    const lambda = new NodejsFunction(this, "readingServiceHandler", {
      functionName: "reading-service-handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(10),
      entry: path.join(__dirname, "../src/handler.ts"),
    });

    // LAMBDA PERMISSION

    const lambdaPolicy = new PolicyStatement({
      actions: [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
      ],
      resources: [table.tableArn],
      effect: Effect.ALLOW,
    });

    lambda.addToRolePolicy(lambdaPolicy);

    // REST API
    const authoriser = new CognitoUserPoolsAuthorizer(
      this,
      "readinListAuthoriser",
      {
        cognitoUserPools: [userPool],
      },
    );

    const apiIntegration = new LambdaIntegration(lambda);

    const apiKey = new ApiKey(this, "readingListApiKey", {
      apiKeyName: "readingListApiKey",
    });

    const readingListApi = new RestApi(this, "readingListApi", {
      restApiName: "readingListApi",
      defaultCorsPreflightOptions: {
        allowOrigins: ["http://localhost:3000"],
        allowMethods: ["OPTIONS", "POST", "GET", "PUT", "DELETE"],
      },
      deploy: true,
      defaultMethodOptions: {
        authorizer: authoriser,
        authorizationType: AuthorizationType.COGNITO,
        apiKeyRequired: true,
      },
    });

    const apiKeyPlan = readingListApi.addUsagePlan("UsagePlan", {
      name: "readingListApiUsagePlan",
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });

    apiKeyPlan.addApiKey(apiKey);

    apiKeyPlan.addApiStage({
      api: readingListApi,
      stage: readingListApi.deploymentStage,
    });

    // FETCH ALL ENTRIES

    readingListApi.root.addMethod("GET", apiIntegration, {});

    // USER ROUTE

    const userRoute = readingListApi.root.addResource("{userId}");
    userRoute.addMethod("GET", apiIntegration, {});

    userRoute.addMethod("POST", apiIntegration, {});

    // ENTRY ROUTE

    const entryRoute = userRoute.addResource("{entryId}");

    entryRoute.addMethod("GET", apiIntegration, {});

    entryRoute.addMethod("PUT", apiIntegration, {});

    entryRoute.addMethod("DELETE", apiIntegration, {});

    new CfnOutput(this, "readingStackApiURL", {
      value: readingListApi.url as string,
    });
  }
}
