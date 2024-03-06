import { Stack, StackProps, Stage } from "aws-cdk-lib";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
import { Repository } from "aws-cdk-lib/aws-codecommit";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { GummyPromotionStack } from "./gummy-promotion-stack";

class GummyPromotionStage extends Stage {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new GummyPromotionStack(this, "GummyPromotionStack");
  }
}

export class GummyPromotionPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const source = CodePipelineSource.codeCommit(
      Repository.fromRepositoryName(this, "Source", "gummy-promotion"),
      "test"
    );

    const pipeline = new CodePipeline(this, "GummyPromotionPipeline", {
      synth: new ShellStep("Synth", {
        input: source,
        commands: ["npm install -g aws-cdk && npm install", "cdk synth"],
      }),
      synthCodeBuildDefaults: {
        partialBuildSpec: BuildSpec.fromObject({
          reports: {
            "cdk-synth": {
              files: ["cdk.out/*-NagReport.csv"],
              "file-format": "csv",
            },
          },
        }),
      },
    });

    const deploy = new GummyPromotionStage(this, "Deploy");
    pipeline.addStage(deploy);
  }
}
