import { Duration } from "aws-cdk-lib";
import { Instance, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import {
  NetworkLoadBalancer,
  NetworkTargetGroup,
  Protocol,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { InstanceTarget } from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import { Construct } from "constructs";

interface NLBProps {
  vpc: Vpc;
  nlbSecurityGroup: SecurityGroup;
  applicationInstances: Instance[];
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

    const targets = props.applicationInstances.map((instance) => {
      return new InstanceTarget(instance, 8080);
    });

    new NetworkTargetGroup(this, "gummy-promotion-target-group", {
      vpc: props.vpc,
      port: 8080,
      targetGroupName: "gummy-promotion-nlb-tg",
      healthCheck: {
        protocol: Protocol.HTTP,
        interval: Duration.seconds(5),
        timeout: Duration.seconds(3),
        path: "/health",
      },
      targets: targets,
      deregistrationDelay: Duration.seconds(30),
    });
  }
}
