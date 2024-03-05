#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsSolutionsChecks } from "cdk-nag";
import { GummyPromotionStack } from "../lib/gummy-promotion-stack";

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "us-east-1",
};

const app = new cdk.App();

cdk.Aspects.of(app).add(new AwsSolutionsChecks());
// cdk.Aspects.of(app).add(new NIST80053R5Checks());

new GummyPromotionStack(app, "GummyPromotionStack", {
  env: devEnv,
});
