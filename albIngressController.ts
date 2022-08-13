
import * as aws from '@pulumi/aws';
import * as eks from '@pulumi/eks';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { ComponentResourceOptions } from '@pulumi/pulumi';

export default class AlbIngressController extends pulumi.ComponentResource {
  constructor(name: string, args: { cluster: eks.Cluster }, options?: ComponentResourceOptions) {
    super('AlbIngressController', name, args, options);
    const { cluster } = args;

    new aws.iam.RolePolicyAttachment(
      `${name}-eks-nodeInstanceRole-policy-attach`,
      {
        policyArn: ingressControllerPolicy.arn,
        role: cluster.instanceRoles.apply(([role]) => role.name),
      },
      { parent: this },
    );

    new k8s.helm.v3.Chart(
      `${name}-alb`,
      {
        chart: 'aws-load-balancer-controller',
        version: '1.4.3',
        fetchOpts: {
          repo: 'https://aws.github.io/eks-charts',
        },
        values: {
          clusterName: cluster.eksCluster.name,
          autoDiscoverAwsRegion: 'true',
          autoDiscoverAwsVpcID: 'true',
        },
      },
      { provider: cluster.provider, parent: this },
    );
  }
}

// Create IAM Policy for the IngressController called "ingressController-iam-policy” and read the policy ARN.
const ingressControllerPolicy = new aws.iam.Policy(
  'ingressController-iam-policy',
  {
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'acm:DescribeCertificate',
            'acm:ListCertificates',
            'acm:GetCertificate',
          ],
          Resource: '*',
        },
        {
          Effect: 'Allow',
          Action: [
            'ec2:AuthorizeSecurityGroupIngress',
            'ec2:CreateSecurityGroup',
            'ec2:CreateTags',
            'ec2:DeleteTags',
            'ec2:DeleteSecurityGroup',
            'ec2:DescribeInstances',
            'ec2:DescribeInstanceStatus',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeSubnets',
            'ec2:DescribeTags',
            'ec2:DescribeVpcs',
            'ec2:ModifyInstanceAttribute',
            'ec2:ModifyNetworkInterfaceAttribute',
            'ec2:RevokeSecurityGroupIngress',
          ],
          Resource: '*',
        },
        {
          Effect: 'Allow',
          Action: [
            'elasticloadbalancing:AddTags',
            'elasticloadbalancing:CreateListener',
            'elasticloadbalancing:CreateLoadBalancer',
            'elasticloadbalancing:CreateRule',
            'elasticloadbalancing:CreateTargetGroup',
            'elasticloadbalancing:DeleteListener',
            'elasticloadbalancing:DeleteLoadBalancer',
            'elasticloadbalancing:DeleteRule',
            'elasticloadbalancing:DeleteTargetGroup',
            'elasticloadbalancing:DeregisterTargets',
            'elasticloadbalancing:DescribeListeners',
            'elasticloadbalancing:DescribeLoadBalancers',
            'elasticloadbalancing:DescribeLoadBalancerAttributes',
            'elasticloadbalancing:DescribeRules',
            'elasticloadbalancing:DescribeSSLPolicies',
            'elasticloadbalancing:DescribeTags',
            'elasticloadbalancing:DescribeTargetGroups',
            'elasticloadbalancing:DescribeTargetGroupAttributes',
            'elasticloadbalancing:DescribeTargetHealth',
            'elasticloadbalancing:ModifyListener',
            'elasticloadbalancing:ModifyLoadBalancerAttributes',
            'elasticloadbalancing:ModifyRule',
            'elasticloadbalancing:ModifyTargetGroup',
            'elasticloadbalancing:ModifyTargetGroupAttributes',
            'elasticloadbalancing:RegisterTargets',
            'elasticloadbalancing:RemoveTags',
            'elasticloadbalancing:SetIpAddressType',
            'elasticloadbalancing:SetSecurityGroups',
            'elasticloadbalancing:SetSubnets',
            'elasticloadbalancing:SetWebACL',
          ],
          Resource: '*',
        },
        {
          Effect: 'Allow',
          Action: ['iam:GetServerCertificate', 'iam:ListServerCertificates'],
          Resource: '*',
        },
        {
          Effect: 'Allow',
          Action: [
            'waf-regional:GetWebACLForResource',
            'waf-regional:GetWebACL',
            'waf-regional:AssociateWebACL',
            'waf-regional:DisassociateWebACL',
          ],
          Resource: '*',
        },
        {
          Effect: 'Allow',
          Action: ['tag:GetResources', 'tag:TagResources'],
          Resource: '*',
        },
        {
          Effect: 'Allow',
          Action: ['waf:GetWebACL'],
          Resource: '*',
        },
      ],
    },
  },
);