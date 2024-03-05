#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GummyPromotionStack } from "../lib/gummy-promotion-stack";

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "us-east-1",
};

const app = new cdk.App();
new GummyPromotionStack(app, "GummyPromotionStack", {
  env: devEnv,
});
