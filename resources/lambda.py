import boto3
def lambda_handler(event, context):
    message = "My Custom Message"
    client = boto3.client('sns')
    response = client.publish(
        TopicArn='arn:aws:sns:us-east-2:894811232850:mytopic',
        Message='Hello Friends!! How are you',
        Subject='Hello',
        )