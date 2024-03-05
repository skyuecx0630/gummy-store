import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { config } from "dotenv";
import { ApplicationResource, VPCResource } from "../src";
import { NLBResource } from "../src/nlb";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

config();

export class GummyPromotionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpcResource = new VPCResource(this, "VPC");

    const application = new ApplicationResource(this, "Application", {
      vpc: vpcResource.vpc,
      applicationSecurityGroup: vpcResource.applicationSecurityGroup,
    });

    const nlb = new NLBResource(this, "NLB", {
      vpc: vpcResource.vpc,
      nlbSecurityGroup: vpcResource.nlbSecurityGroup,
    });

    new cdk.CfnOutput(this, "ApplicationInstanceId", {
      value: application.instance.instanceId,
    });

    new cdk.CfnOutput(this, "NLBEndpoint", {
      value: nlb.nlb.loadBalancerDnsName,
    });
  }
}
