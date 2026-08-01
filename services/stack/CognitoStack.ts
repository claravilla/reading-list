import {
  App,
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  AccountRecovery,
  ClientAttributes,
  StringAttribute,
  UserPool,
  UserPoolEmail,
} from "aws-cdk-lib/aws-cognito";

export default class CognitoStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // USER POOL
    
    const userServiceEmail =
      process.env.USER_SERVICE_EMAIL || "reading-list-users@proton.me";
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

     new CfnOutput(this, "cognitoPoolArn", {
          value: userPool.userPoolArn as string,
          exportName: "readingListUserPoolArn"
        });
  }
}
