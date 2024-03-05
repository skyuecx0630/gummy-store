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

    const applicationResource = new ApplicationResource(this, "Application", {
      vpc: vpcResource.vpc,
      applicationSecurityGroup: vpcResource.applicationSecurityGroup,
    });

    const nlbResource = new NLBResource(this, "NLB", {
      vpc: vpcResource.vpc,
      nlbSecurityGroup: vpcResource.nlbSecurityGroup,
      applicationInstances: [applicationResource.instance],
    });

    new cdk.CfnOutput(this, "ApplicationInstanceId", {
      value: applicationResource.instance.instanceId,
    });

    new cdk.CfnOutput(this, "NLBEndpoint", {
      value: nlbResource.nlb.loadBalancerDnsName,
    });
  }
}
