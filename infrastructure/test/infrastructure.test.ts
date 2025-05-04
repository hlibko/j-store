import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Infrastructure from '../lib/infrastructure-stack';

describe('InfrastructureStack', () => {
  let app: cdk.App;
  let stack: Infrastructure.InfrastructureStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new Infrastructure.InfrastructureStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('S3 Bucket Created with Correct Configuration', () => {
    // Verify the S3 bucket is created with the correct properties
    template.hasResourceProperties('AWS::S3::Bucket', {
      WebsiteConfiguration: {
        IndexDocument: 'index.html',
        ErrorDocument: 'index.html'
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      }
    });
  });

  test('CloudFront Origin Access Identity Created', () => {
    // Verify the CloudFront OAI is created
    template.resourceCountIs('AWS::CloudFront::CloudFrontOriginAccessIdentity', 1);
    
    template.hasResourceProperties('AWS::CloudFront::CloudFrontOriginAccessIdentity', {
      CloudFrontOriginAccessIdentityConfig: {
        Comment: 'Allow CloudFront to access the website bucket'
      }
    });
  });

  test('S3 Bucket Policy Includes GetObject Permission', () => {
    // Check that there's a bucket policy with s3:GetObject permission
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 's3:GetObject',
            Effect: 'Allow',
            Principal: {
              CanonicalUser: Match.anyValue()
            }
          })
        ])
      }
    });
  });

  test('CloudFront Distribution Created with Correct Configuration', () => {
    // Verify the CloudFront distribution is created with the correct properties
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultRootObject: 'index.html',
        Origins: [
          {
            S3OriginConfig: {
              OriginAccessIdentity: {
                'Fn::Join': [
                  '',
                  [
                    'origin-access-identity/cloudfront/',
                    {
                      'Ref': Match.stringLikeRegexp('OriginAccessIdentity')
                    }
                  ]
                ]
              }
            }
          }
        ],
        DefaultCacheBehavior: {
          AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
          Compress: true,
          ViewerProtocolPolicy: 'redirect-to-https'
        },
        CustomErrorResponses: [
          {
            ErrorCode: 404,
            ResponseCode: 200,
            ResponsePagePath: '/index.html'
          }
        ]
      }
    });
  });

  test('S3 Bucket Deployment Resource Created', () => {
    // Verify the S3 deployment resource is created
    template.resourceCountIs('Custom::CDKBucketDeployment', 1);
  });

  test('CloudFront Domain Name Output Created', () => {
    // Verify the CloudFront domain name output is created
    template.hasOutput('DistributionDomainName', {
      Description: 'The domain name of the CloudFront distribution'
    });
  });

  test('S3 Bucket Name Output Created', () => {
    // Verify the S3 bucket name output is created
    template.hasOutput('WebsiteBucketName', {
      Description: 'The name of the S3 bucket'
    });
  });
  
  test('Auto Delete Objects Custom Resource Created', () => {
    // Verify the custom resource for auto-deleting objects is created
    template.resourceCountIs('Custom::S3AutoDeleteObjects', 1);
  });
});