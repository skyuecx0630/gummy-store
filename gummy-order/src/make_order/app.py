import json
import boto3
import uuid
import os

# client = boto3.client("dynamodb")
dynamodb = boto3.resource("dynamodb")
table_name = os.environ.get("TABLE_NAME")
table = dynamodb.Table(table_name)


def create_order(amount: int, redeem_code=""):
    order_id = str(uuid.uuid4())
    order_item = {"order_id": order_id, "amount": amount}

    table.put_item(Item=order_item)
    print(order_item)
    return order_item


def lambda_handler(event, context):
    body = json.loads(event["body"])
    amount = body.get("amount", 0)
    if not amount or amount < 1:
        raise ValueError("Parameter amount should be a valid natural number")

    response = create_order(amount)

    return {"statusCode": 200, "body": json.dumps(response)}
