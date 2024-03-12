import json
import boto3
import os

from decimal import Decimal


# client = boto3.client("dynamodb")
dynamodb = boto3.resource("dynamodb")
table_name = os.environ.get("TABLE_NAME")
table = dynamodb.Table(table_name)


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj)
        return json.JSONEncoder.default(self, obj)


def get_order(order_id: str):
    response = table.get_item(Key={"order_id": order_id})
    try:
        order_item = response["Item"]
    except KeyError:
        order_item = {}
    print(order_item)
    return order_item


def lambda_handler(event, context):
    order_id = event["pathParameters"].get("order_id", "")
    if not order_id:
        raise ValueError("Parameter amount should be a valid natural number")

    response = get_order(order_id)

    return {
        "statusCode": 200 if response else 404,
        "body": json.dumps(response, cls=DecimalEncoder),
    }
