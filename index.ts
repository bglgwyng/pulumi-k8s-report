import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from '@pulumi/eks';
import AlbIngressController from './albIngressController';

const vpc = new awsx.ec2.Vpc('fargate-vpc', {});

// Create the EKS cluster itself with Fargate enabled.
const cluster = new eks.Cluster('fargate-cluster', {
  fargate: true,
  vpcId: vpc.id,
  subnetIds: vpc.privateSubnetIds,
});

new AlbIngressController('alb-ingress-controller', { cluster });

export const kubeconfig = pulumi.secret(cluster.kubeconfig);
