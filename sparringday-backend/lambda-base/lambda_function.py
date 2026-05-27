import json
import boto3
import os

dynamodb = boto3.resource(
    "dynamodb",
    endpoint_url=os.environ.get("DYNAMODB_ENDPOINT", "http://localhost:4566"),
    region_name="us-east-1"
)

table = dynamodb.Table("SparringDayAthletes")

def lambda_handler(event, context):
    response = table.scan()

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "message": "Sparring Day API funcionando",
            "athletes": response.get("Items", [])
        })
    }