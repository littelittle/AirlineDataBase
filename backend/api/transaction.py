from api.passenger import make_transaction
from flask import Blueprint, jsonify, request

transaction_api = Blueprint('transaction_api', __name__)


@transaction_api.route('/transaction', methods=['POST'])
def handle_transaction():
    return make_transaction()
