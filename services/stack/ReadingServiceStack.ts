import { App, CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export default class ReadingServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const entriesTable = new Table(this, "entriesTable", {
      tableName: "reading-entries",
      partitionKey: {
        type: AttributeType.STRING,
        name: "id",
      },
      sortKey: {
        type: AttributeType.STRING,
        name: "user",
      },
    });

    const lambda = new NodejsFunction(this, "readingServiceHandler", {
      functionName: "reading-service-handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(10),
      entry: path.join(__dirname, "../src/handler.ts"),
    });

    lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:DeleteItem",
        ],
        resources: [entriesTable.tableArn],
      }),
    );

    const apiIntegration = new HttpLambdaIntegration("apiIntegration", lambda);

    const apiList = new HttpApi(this, "readingListApi");

    apiList.addRoutes({
      path: "/",
      methods: [HttpMethod.GET],
      integration: apiIntegration,
    });

    apiList.addRoutes({
      path: "/{username}",
      methods: [HttpMethod.GET],
      integration: apiIntegration,
    });

    apiList.addRoutes({
      path: "/{username}",
      methods: [HttpMethod.POST],
      integration: apiIntegration,
    });

    new CfnOutput(this, "apiURL", {
      value: apiList.url as string,
    });
  }
}
