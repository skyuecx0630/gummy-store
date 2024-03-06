import { App, Aspects } from "aws-cdk-lib";
import { Annotations, Match } from "aws-cdk-lib/assertions";
import { SynthesisMessage } from "aws-cdk-lib/cx-api";
import { AwsSolutionsChecks, NagSuppressions } from "cdk-nag";
import { GummyPromotionPipelineStack } from "../lib/gummy-promotion-pipeline-stack";

function synthesisMessageToString(sm: SynthesisMessage): string {
  return `${sm.entry.data} [${sm.id}]`;
}

describe("cdk-nag", () => {
  let stack: GummyPromotionPipelineStack;
  let app: App;

  beforeAll(() => {
    app = new App();
    stack = new GummyPromotionPipelineStack(app, "TestStack", {
      env: {
        account: "dummy",
        region: "us-east-1",
      },
    });
    Aspects.of(stack).add(new AwsSolutionsChecks());

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
  });

  test("cdk-nag AwsSolutions Pack errors", () => {
    const errors = Annotations.fromStack(stack)
      .findError("*", Match.stringLikeRegexp("AwsSolutions-.*"))
      .map(synthesisMessageToString);
    expect(errors).toHaveLength(0);
  });

  test("cdk-nag AwsSolutions Pack warnings", () => {
    const warnings = Annotations.fromStack(stack)
      .findWarning("*", Match.stringLikeRegexp("AwsSolutions-.*"))
      .map(synthesisMessageToString);
    expect(warnings).toHaveLength(0);
  });
});
