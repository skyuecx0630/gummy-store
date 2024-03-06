import {
  AmazonLinuxCpuType,
  BlockDeviceVolume,
  CfnInstance,
  CloudFormationInit,
  InitCommand,
  InitConfig,
  InitFile,
  InitSource,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  SecurityGroup,
  SubnetType,
  UserData,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { NagSuppressions } from "cdk-nag";
import { Construct } from "constructs";

interface ApplicationProps {
  vpc: Vpc;
  applicationSecurityGroup: SecurityGroup;
}

export class ApplicationResource extends Construct {
  public instance: Instance;

  constructor(scope: Construct, id: string, props: ApplicationProps) {
    super(scope, id);

    const userData = UserData.forLinux();
    userData.addCommands(
      "yum update -y",
      "python3 -m ensurepip",
      "mkdir -p /home/ec2-user/app"
    );

    this.instance = new Instance(this, "gummy-promotion-application", {
      instanceName: "gummy-promotion-application",
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      machineImage: MachineImage.latestAmazonLinux2023({
        cpuType: AmazonLinuxCpuType.X86_64,
      }),
      vpc: props.vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroup: props.applicationSecurityGroup,
      userData: userData,
      userDataCausesReplacement: true,
      detailedMonitoring: true,
      init: CloudFormationInit.fromConfig(
        new InitConfig([
          InitSource.fromAsset("/home/ec2-user/app", "src/resources/app"),
          InitFile.fromFileInline(
            "/etc/config.sh",
            "src/resources/config/config.sh"
          ),
          InitFile.fromFileInline(
            "/etc/systemd/system/app.service",
            "src/resources/config/app.service"
          ),
          InitCommand.shellCommand("chmod +x /etc/config.sh"),
          InitCommand.shellCommand("/etc/config.sh"),
        ])
      ),
      ssmSessionPermissions: true,
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: BlockDeviceVolume.ebs(20, { encrypted: true }),
        },
      ],
    });

    NagSuppressions.addResourceSuppressions(
      this.instance,
      [
        {
          id: "AwsSolutions-IAM4",
          reason: "SSM Managed Instance Core",
        },
        {
          id: "AwsSolutions-IAM5",
          reason: "Allow downloading CDK assets",
        },
        {
          id: "AwsSolutions-EC29",
          reason: "Ignore termination protection",
        },
      ],
      true
    );
  }
}
