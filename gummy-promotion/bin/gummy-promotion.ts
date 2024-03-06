#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsSolutionsChecks, NagSuppressions } from "cdk-nag";
import { GummyPromotionStack } from "../lib/gummy-promotion-stack";
import { GummyPromotionPipelineStack } from "../lib/gummy-promotion-pipeline-stack";

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "us-east-1",
};

const app = new cdk.App();
// const stack = new GummyPromotionStack(app, "GummyPromotionStack", {
//   env: devEnv,
// });

const stack = new GummyPromotionPipelineStack(
  app,
  "GummyPromotionPipelineStack",
  {
    env: devEnv,
  }
);

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
NagSuppressions.addResourceSuppressionsByPath(
  stack,
  `/${stack.stackName}/${stack.pipeline.node.id}`,
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "Pipeline execution permissions",
    },
    {
      id: "AwsSolutions-CB4",
      reason: "Codebuild without encryption",
    },
  ],
  true
);
// cdk.Aspects.of(app).add(new NIST80053R5Checks());
