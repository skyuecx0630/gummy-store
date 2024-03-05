import {
  Vpc,
  SecurityGroup,
  Port,
  SubnetType,
  Peer,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class VPCResource extends Construct {
  public vpc: Vpc;
  public applicationSecurityGroup: SecurityGroup;
  public nlbSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc = new Vpc(this, "VPC", {
      vpcName: "gummy-promotion-vpc",
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: "gummy-promotion-public",
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
          mapPublicIpOnLaunch: true,
        },
        {
          name: "gummy-promotion-private",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
    });

    this.applicationSecurityGroup = new SecurityGroup(
      this,
      "gummy-promotion-application-sg",
      {
        vpc: this.vpc,
        description: "Security group for application",
        allowAllOutbound: true,
      }
    );

    this.nlbSecurityGroup = new SecurityGroup(this, "gummy-promotion-nlb-sg", {
      vpc: this.vpc,
      description: "Security group for NLB",
      allowAllOutbound: false,
    });

    this.nlbSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80));

    this.nlbSecurityGroup.addEgressRule(
      this.applicationSecurityGroup,
      Port.tcp(8080)
    );

    this.applicationSecurityGroup.addIngressRule(
      this.nlbSecurityGroup,
      Port.tcp(8080)
    );
  }
}
