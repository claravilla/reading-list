import { App, CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export default class TextExtactServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);


    const lambda = new NodejsFunction(this, "textExtractServiceHandler", {
      functionName: "text-extract-service-handler",
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(60),
      entry: path.join(__dirname, "../src/textExtractService.ts"),
    });


    const apiIntegration = new HttpLambdaIntegration("apiIntegration", lambda);

    const apiTextExtract = new HttpApi(this, "textExtractApi");

   apiTextExtract.addRoutes({
      path: "/",
      methods: [HttpMethod.POST],
      integration: apiIntegration,
    });


    new CfnOutput(this, "textStackApiURL", {
      value: apiTextExtract.url as string,
    });
  }
}
