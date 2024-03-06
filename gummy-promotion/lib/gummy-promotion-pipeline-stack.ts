import { IgnoreMode, Stack, StackProps, Stage } from "aws-cdk-lib";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
import { Code, Repository } from "aws-cdk-lib/aws-codecommit";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { GummyPromotionStack } from "./gummy-promotion-stack";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import * as fs from "fs";

class GummyPromotionStage extends Stage {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new GummyPromotionStack(this, "GummyPromotionStack");
  }
}

export class GummyPromotionPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    let gitignore = fs.readFileSync(".gitignore").toString().split(/\r?\n/);
    gitignore.push(".git/");

    // Allow canary code to package properly
    // see: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries_WritingCanary_Nodejs.html#CloudWatch_Synthetics_Canaries_package
    gitignore = gitignore.filter((g: string) => g != "node_modules/");
    gitignore.push("/node_modules/");

    const codeAsset = new Asset(this, "SourceAsset", {
      path: ".",
      ignoreMode: IgnoreMode.GIT,
      exclude: gitignore,
    });

    const source = CodePipelineSource.codeCommit(
      new Repository(this, "Source", {
        repositoryName: "gummy-promotion",
        code: Code.fromAsset(codeAsset, "main"),
      }),
      "main"
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
