import { SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { NetworkLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

interface NLBProps {
  vpc: Vpc;
  nlbSecurityGroup: SecurityGroup;
}

export class NLBResource extends Construct {
  public nlb: NetworkLoadBalancer;
  constructor(scope: Construct, id: string, props: NLBProps) {
    super(scope, id);

    this.nlb = new NetworkLoadBalancer(this, "gummy-promotion-nlb", {
      loadBalancerName: "gummy-promotion-nlb",
      internetFacing: false,
      vpc: props.vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [props.nlbSecurityGroup],
    });
  }
}
