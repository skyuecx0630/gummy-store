import { RemovalPolicy } from "aws-cdk-lib";
import {
  AmazonLinuxCpuType,
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
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

interface ApplicationProps {
  vpc: Vpc;
  applicationSecurityGroup: SecurityGroup;
}

export class ApplicationResource extends Construct {
  public instance: Instance;

  constructor(scope: Construct, id: string, props: ApplicationProps) {
    super(scope, id);

    const assetBucket = new Bucket(this, "gummy-promotion-asset-bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      publicReadAccess: false,
      autoDeleteObjects: true,
    });

    new BucketDeployment(this, "gummy-promotion-asset-deployment", {
      sources: [Source.asset("src/app")],
      destinationBucket: assetBucket,
      retainOnDelete: false,
    });

    const role = new Role(this, "gummy-promotion-application-role", {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
      ],
    });

    assetBucket.grantRead(role);

    const userData = UserData.forLinux();

    userData.addCommands(
      "yum update -y",
      "mkdir -p /home/ec2-user/app",
      "aws s3 cp s3://" +
        assetBucket.bucketName +
        "/ /home/ec2-user/app/ --recursive",
      "python3 -m ensurepip",
      "python3 -m pip install -r /home/ec2-user/app/requirements.txt",
      "nohup python3 /home/ec2-user/app/app.py > /var/log/app.log 2>&1 < /dev/null &"
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
      role: role,
      userData: userData,
    });
  }
}
