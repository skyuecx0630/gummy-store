import boto3
import hashlib
from flask import Flask, request, make_response, abort


app = Flask(__name__)
logger = app.logger

# ssm = boto3.client('ssm')
SALT = b"hello"

VALID_CODE = ["gummy1", "store", "world"]


@app.get("/")
def hello():
    return make_response("This is gummy promotion application", 200)


@app.get("/health")
def health():
    return make_response("OK", 200)


@app.post("/coupon")
def issue_promotion_coupon():
    try:
        user_id: str = request.json["user_id"]
        code: str = request.json["code"]
        logger.debug(f"user_id: {user_id}")
        logger.debug(f"code: {code}")
    except KeyError:
        return abort(400, "Bad input")

    if code not in VALID_CODE:
        return abort(400, "Bad code")

    hash_func = hashlib.sha256(SALT)
    hash_func.update(user_id.encode())
    hash_func.update(code.encode())

    coupon_hash = hash_func.hexdigest()[:16]
    logger.debug(f"hash: {coupon_hash}")
    return make_response(coupon_hash, 200)


if __name__ == "__main__":
    app.logger.setLevel("DEBUG")
    app.run("0.0.0.0", 8080)
