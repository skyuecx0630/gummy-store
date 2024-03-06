#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsSolutionsChecks, NagSuppressions } from "cdk-nag";
import { GummyPromotionStack } from "../lib/gummy-promotion-stack";

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "us-east-1",
};

const app = new cdk.App();
const stack = new GummyPromotionStack(app, "GummyPromotionStack", {
  env: devEnv,
});

cdk.Aspects.of(app).add(new AwsSolutionsChecks());
NagSuppressions.addStackSuppressions(stack, [
  {
    id: "AwsSolutions-VPC7",
    reason: "No logging",
  },
  {
    id: "AwsSolutions-S1",
    reason: "No logging",
  },
  {
    id: "AwsSolutions-ELB2",
    reason: "No logging",
  },
]);
// cdk.Aspects.of(app).add(new NIST80053R5Checks());
