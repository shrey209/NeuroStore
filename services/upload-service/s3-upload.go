package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"
)

var s3Client *s3.Client
var bucketName string

// InitS3 loads environment variables and initializes the S3 client
func InitS3() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(" Error loading .env file")
	}

	bucketName = os.Getenv("BUCKET_NAME")
	region := os.Getenv("REGION")
	accessKey := os.Getenv("ACCESS_KEY_ID")
	secretKey := os.Getenv("SECRET_KEY")

	// Basic validation of critical environment variables
	if bucketName == "" || region == "" || accessKey == "" || secretKey == "" {
		log.Fatal(" Missing one or more required environment variables (BUCKET_NAME, REGION, ACCESS_KEY_ID, SECRET_KEY)")
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		log.Fatalf(" Unable to load AWS config: %v", err)
	}

	s3Client = s3.NewFromConfig(cfg)
	fmt.Println(" AWS S3 client initialized.")
}

// UploadBinFileToS3 uploads a local file to S3 at the given key
func UploadBinFileToS3(filePath string, key string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf(" Failed to open file %s: %v", filePath, err)
	}
	defer file.Close()

	_, err = s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
		Body:   file,
	})
	if err != nil {
		return fmt.Errorf(" Failed to upload to S3: %v", err)
	}

	fmt.Printf(" Successfully uploaded %s to bucket %s\n", key, bucketName)
	return nil
}
