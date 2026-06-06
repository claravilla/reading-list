import { App, CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { ApiKey, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
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

    // ------------------------------------
    // REST API
    // ------------------------------------

    const apiIntegration = new LambdaIntegration(lambda);

    const apiKey = new ApiKey(this, "textExtractApiKey", {
      apiKeyName: "textExtractApiKey",
    });

    const textExtractApi = new RestApi(this, "textExtractApi", {
      restApiName: "textExtractApi",
      defaultCorsPreflightOptions: {
        allowOrigins: ["http://localhost:3000"],
        allowMethods: ["OPTIONS", "POST"],
      },
      binaryMediaTypes: ["image/*", "multipart/form-data"],
    });

    const apiKeyPlan = textExtractApi.addUsagePlan("UsagePlan", {
      name: "TextExtractUsagePlan",
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });

    apiKeyPlan.addApiKey(apiKey);

    apiKeyPlan.addApiStage({
      api: textExtractApi,
      stage: textExtractApi.deploymentStage,
    });

    textExtractApi.root.addMethod("POST", apiIntegration, {
      apiKeyRequired: true,
    });

    new CfnOutput(this, "textStackApiURL", {
      value: textExtractApi.url as string,
    });
  }
}
