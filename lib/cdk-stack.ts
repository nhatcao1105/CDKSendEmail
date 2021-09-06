import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { AccountPrincipal, Effect, ManagedPolicy, Policy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string,prop: cdk.StackProps) {
    super(scope, id);

    const topic = new sns.Topic(this, 'Topic',{
      displayName: 'CMNCompany',
      topicName:'mytopic',
    });
    topic.addSubscription(new subscriptions.EmailSubscription('caominhnhat99tg@gmail.com'));

    const roleForLambda = new Role(this,'RoleLambda',{
      roleName:'roleForLambda',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies:[
        ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        
      ]
    });

    const handler =new lambda.Function(this, 'MyFunction',{
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("resources"),
      handler: "lambda.lambda_handler",
      role: roleForLambda
    });
    roleForLambda.attachInlinePolicy(
      new Policy(this,'policy',{
        statements: [
          new PolicyStatement({
            actions:['sns:Publish'],
            resources:["*"],
          })
        ]
    }));

    const rule =new Rule(this, 'rule',{
      schedule: Schedule.cron({minute:'0/2'})

    });
    rule.addTarget(new targets.LambdaFunction(handler));

    const role = new Role(this, 'Role',{
      assumedBy: new ServicePrincipal('events.amazonaws.com')
    });
    role.addToPolicy(new PolicyStatement({
      resources: ['*'],
      actions:['lambda:InvokeFunction'],
    }));

    const TopicPolicy =new sns.TopicPolicy(this, 'Policy',{
      topics:[topic]
  
    })
    TopicPolicy.document.addStatements(new PolicyStatement({
      actions:["sns:Publish","sns:Subscribe"],
      principals:[new iam.ServicePrincipal('lambda.amazonaws.com')],
      effect: Effect.ALLOW,
      resources:['*']

    }));
}}
