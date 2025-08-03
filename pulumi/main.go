package main

import (
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/elasticache"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/rds"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/ses"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/ssm"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Get configuration
		cfg := config.New(ctx, "")
		environment := cfg.Get("environment")
		if environment == "" {
			environment = "dev"
		}
		domain := cfg.Require("domain") // e.g., "example.com"

		// Create local development parameters if environment is "local"
		if environment == "local" {
			localDbParam, err := ssm.NewParameter(ctx, "local-db-url", &ssm.ParameterArgs{
				Name:        pulumi.String("/origin/local/database-url"),
				Type:        pulumi.String("String"),
				Value:       pulumi.String("postgresql://postgres:password@localhost:5432/origin"),
				Description: pulumi.String("Local development database URL"),
			})
			if err != nil {
				return err
			}

			localRedisParam, err := ssm.NewParameter(ctx, "local-redis-url", &ssm.ParameterArgs{
				Name:        pulumi.String("/origin/local/redis-url"),
				Type:        pulumi.String("String"),
				Value:       pulumi.String("redis://localhost:6379"),
				Description: pulumi.String("Local development Redis URL"),
			})
			if err != nil {
				return err
			}

			localJwtParam, err := ssm.NewParameter(ctx, "local-jwt-secret", &ssm.ParameterArgs{
				Name:        pulumi.String("/origin/local/jwt-secret"),
				Type:        pulumi.String("SecureString"),
				Value:       pulumi.String("local-development-jwt-secret-change-in-production"),
				Description: pulumi.String("Local development JWT secret"),
			})
			if err != nil {
				return err
			}

			localClaudeParam, err := ssm.NewParameter(ctx, "local-claude-api-key", &ssm.ParameterArgs{
				Name:        pulumi.String("/origin/local/claude-api-key"),
				Type:        pulumi.String("SecureString"),
				Value:       pulumi.String("sk-local-development-claude-key"),
				Description: pulumi.String("Local development Claude API key"),
			})
			if err != nil {
				return err
			}

			// Export local parameter names
			ctx.Export("localDbUrlParameterName", localDbParam.Name)
			ctx.Export("localRedisUrlParameterName", localRedisParam.Name)
			ctx.Export("localJwtSecretParameterName", localJwtParam.Name)
			ctx.Export("localClaudeApiKeyParameterName", localClaudeParam.Name)

			return nil
		}

		// SES Domain Identity
		sesIdentity, err := ses.NewDomainIdentity(ctx, "ses-domain", &ses.DomainIdentityArgs{
			Domain: pulumi.String(domain),
		})
		if err != nil {
			return err
		}

		// SES Domain DKIM
		sesDkim, err := ses.NewDomainDkim(ctx, "ses-dkim", &ses.DomainDkimArgs{
			Domain: sesIdentity.Domain,
		})
		if err != nil {
			return err
		}

		// SES Configuration Set
		sesConfigSet, err := ses.NewConfigurationSet(ctx, "ses-config-set", &ses.ConfigurationSetArgs{
			Name: pulumi.Sprintf("%s-origin-config-set", environment),
		})
		if err != nil {
			return err
		}

		// VPC and Security Groups for database access
		defaultVpc, err := ec2.LookupVpc(ctx, &ec2.LookupVpcArgs{
			Default: pulumi.BoolRef(true),
		})
		if err != nil {
			return err
		}

		defaultSubnets, err := ec2.GetSubnets(ctx, &ec2.GetSubnetsArgs{
			Filters: []ec2.GetSubnetsFilter{
				{
					Name:   "vpc-id",
					Values: []string{defaultVpc.Id},
				},
				{
					Name:   "default-for-az",
					Values: []string{"true"},
				},
			},
		})
		if err != nil {
			return err
		}

		// Security Group for RDS
		dbSecurityGroup, err := ec2.NewSecurityGroup(ctx, "db-security-group", &ec2.SecurityGroupArgs{
			Name:        pulumi.Sprintf("%s-origin-db-sg", environment),
			Description: pulumi.String("Security group for RDS PostgreSQL"),
			VpcId:       pulumi.String(defaultVpc.Id),
			Ingress: ec2.SecurityGroupIngressArray{
				&ec2.SecurityGroupIngressArgs{
					Protocol:   pulumi.String("tcp"),
					FromPort:   pulumi.Int(5432),
					ToPort:     pulumi.Int(5432),
					CidrBlocks: pulumi.StringArray{pulumi.String("10.0.0.0/8")}, // Allow from VPC
				},
			},
			Egress: ec2.SecurityGroupEgressArray{
				&ec2.SecurityGroupEgressArgs{
					Protocol:   pulumi.String("-1"),
					FromPort:   pulumi.Int(0),
					ToPort:     pulumi.Int(0),
					CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
				},
			},
		})
		if err != nil {
			return err
		}

		// Security Group for ElastiCache
		cacheSecurityGroup, err := ec2.NewSecurityGroup(ctx, "cache-security-group", &ec2.SecurityGroupArgs{
			Name:        pulumi.Sprintf("%s-origin-cache-sg", environment),
			Description: pulumi.String("Security group for ElastiCache Redis"),
			VpcId:       pulumi.String(defaultVpc.Id),
			Ingress: ec2.SecurityGroupIngressArray{
				&ec2.SecurityGroupIngressArgs{
					Protocol:   pulumi.String("tcp"),
					FromPort:   pulumi.Int(6379),
					ToPort:     pulumi.Int(6379),
					CidrBlocks: pulumi.StringArray{pulumi.String("10.0.0.0/8")}, // Allow from VPC
				},
			},
			Egress: ec2.SecurityGroupEgressArray{
				&ec2.SecurityGroupEgressArgs{
					Protocol:   pulumi.String("-1"),
					FromPort:   pulumi.Int(0),
					ToPort:     pulumi.Int(0),
					CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
				},
			},
		})
		if err != nil {
			return err
		}

		// RDS Subnet Group
		dbSubnetGroup, err := rds.NewSubnetGroup(ctx, "db-subnet-group", &rds.SubnetGroupArgs{
			Name:       pulumi.Sprintf("%s-origin-db-subnet-group", environment),
			SubnetIds:  pulumi.ToStringArray(defaultSubnets.Ids),
			Tags: pulumi.StringMap{
				"Name": pulumi.Sprintf("%s-origin-db-subnet-group", environment),
			},
		})
		if err != nil {
			return err
		}

		// ElastiCache Subnet Group
		cacheSubnetGroup, err := elasticache.NewSubnetGroup(ctx, "cache-subnet-group", &elasticache.SubnetGroupArgs{
			Name:      pulumi.Sprintf("%s-origin-cache-subnet-group", environment),
			SubnetIds: pulumi.ToStringArray(defaultSubnets.Ids),
		})
		if err != nil {
			return err
		}

		// RDS PostgreSQL Instance
		dbInstance, err := rds.NewInstance(ctx, "postgres-db", &rds.InstanceArgs{
			AllocatedStorage:     pulumi.Int(20),
			StorageType:          pulumi.String("gp2"),
			Engine:               pulumi.String("postgres"),
			EngineVersion:        pulumi.String("15.7"),
			InstanceClass:        pulumi.String("db.t3.micro"), // Free tier eligible
			DbName:               pulumi.String("origin"),
			Username:             pulumi.String("postgres"),
			Password:             pulumi.String("temp-password-change-me"), // You'll change this
			VpcSecurityGroupIds:  pulumi.StringArray{dbSecurityGroup.ID()},
			DbSubnetGroupName:    dbSubnetGroup.Name,
			SkipFinalSnapshot:    pulumi.Bool(true),
			PubliclyAccessible:   pulumi.Bool(false),
			Tags: pulumi.StringMap{
				"Name":        pulumi.Sprintf("%s-origin-postgres", environment),
				"Environment": pulumi.String(environment),
			},
		})
		if err != nil {
			return err
		}

		// ElastiCache Redis Cluster
		redisCluster, err := elasticache.NewReplicationGroup(ctx, "redis-cluster", &elasticache.ReplicationGroupArgs{
			ReplicationGroupId:       pulumi.Sprintf("%s-origin-redis", environment),
			Description:              pulumi.String("Redis cluster for Origin app"),
			NodeType:                 pulumi.String("cache.t3.micro"), // Free tier eligible
			Engine:                   pulumi.String("redis"),
			EngineVersion:            pulumi.String("7.0"),
			Port:                     pulumi.Int(6379),
			NumCacheClusters:         pulumi.Int(1),
			SecurityGroupIds:         pulumi.StringArray{cacheSecurityGroup.ID()},
			SubnetGroupName:          cacheSubnetGroup.Name,
			AtRestEncryptionEnabled:  pulumi.Bool(true),
			TransitEncryptionEnabled: pulumi.Bool(false), // Simplified for development
			Tags: pulumi.StringMap{
				"Name":        pulumi.Sprintf("%s-origin-redis", environment),
				"Environment": pulumi.String(environment),
			},
		})
		if err != nil {
			return err
		}

		// Parameter Store - Database URL (using actual RDS endpoint)
		dbUrlParam, err := ssm.NewParameter(ctx, "db-url", &ssm.ParameterArgs{
			Name: pulumi.Sprintf("/origin/%s/database-url", environment),
			Type: pulumi.String("SecureString"),
			Value: pulumi.Sprintf("postgresql://postgres:temp-password-change-me@%s:5432/origin",
				dbInstance.Endpoint),
			Description: pulumi.String("Database connection URL from RDS"),
		})
		if err != nil {
			return err
		}

		// Parameter Store - Redis URL (using actual ElastiCache endpoint)
		redisUrlParam, err := ssm.NewParameter(ctx, "redis-url", &ssm.ParameterArgs{
			Name: pulumi.Sprintf("/origin/%s/redis-url", environment),
			Type: pulumi.String("String"),
			Value: pulumi.Sprintf("redis://%s:6379",
				redisCluster.ConfigurationEndpointAddress),
			Description: pulumi.String("Redis connection URL from ElastiCache"),
		})
		if err != nil {
			return err
		}

		// Parameter Store - JWT Secret (placeholder - update value manually)
		jwtSecretParam, err := ssm.NewParameter(ctx, "jwt-secret", &ssm.ParameterArgs{
			Name:        pulumi.Sprintf("/origin/%s/jwt-secret", environment),
			Type:        pulumi.String("SecureString"),
			Value:       pulumi.String("PLACEHOLDER_UPDATE_MANUALLY"),
			Description: pulumi.String("JWT signing secret - UPDATE MANUALLY"),
		})
		if err != nil {
			return err
		}

		// Parameter Store - Claude API Key (placeholder - update value manually)
		claudeApiKeyParam, err := ssm.NewParameter(ctx, "claude-api-key", &ssm.ParameterArgs{
			Name:        pulumi.Sprintf("/origin/%s/claude-api-key", environment),
			Type:        pulumi.String("SecureString"),
			Value:       pulumi.String("PLACEHOLDER_UPDATE_MANUALLY"),
			Description: pulumi.String("Claude AI API key - UPDATE MANUALLY"),
		})
		if err != nil {
			return err
		}

		// Exports
		ctx.Export("sesIdentityArn", sesIdentity.Arn)
		ctx.Export("sesDomainVerificationToken", sesIdentity.VerificationToken)
		ctx.Export("sesDkimTokens", sesDkim.DkimTokens)
		ctx.Export("sesConfigSetName", sesConfigSet.Name)
		ctx.Export("dbUrlParameterName", dbUrlParam.Name)
		ctx.Export("redisUrlParameterName", redisUrlParam.Name)
		ctx.Export("jwtSecretParameterName", jwtSecretParam.Name)
		ctx.Export("claudeApiKeyParameterName", claudeApiKeyParam.Name)
		ctx.Export("postgresEndpoint", dbInstance.Endpoint)
		ctx.Export("postgresPort", dbInstance.Port)
		ctx.Export("redisEndpoint", redisCluster.ConfigurationEndpointAddress)
		ctx.Export("redisPort", redisCluster.Port)

		return nil
	})
}