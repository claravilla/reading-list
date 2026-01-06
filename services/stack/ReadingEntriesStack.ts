import { App, CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export default class ReadingEntriesStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const entriesTable = new Table(this, "entriesTable", {
      tableName: "reading-entries",
      partitionKey: {
        type: AttributeType.STRING,
        name: "id",
      },
    });

    const lambda = new NodejsFunction(this, "getEntriesService", {
      functionName: "get-entries-service",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(10),
      entry: path.join(__dirname, "../src/GetReadingEntriesService.ts"),
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
      })
    );

    const apiIntegration = new HttpLambdaIntegration("apiIntegration", lambda);

    const api = new HttpApi(this, "readingListApi");

    api.addRoutes({
      path: "/",
      methods: [HttpMethod.GET],
      integration: apiIntegration,
    });

    new CfnOutput(this, "apiURL", {
      value: api.url as string,
    });
  }
}
