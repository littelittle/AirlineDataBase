import hashlib
import os
import pyrootutils
import jwt
import datetime
root = pyrootutils.setup_root(
    search_from=__file__,
    indicator=["pyproject.toml"],
    pythonpath=True,
    dotenv=True,
)


def generate_salt():
    """Generates a random salt."""
    return os.urandom(16).hex() # Returns a 32-character hex string

def hash_password(password, salt):
    """Hashes a password with the given salt using SHA256."""
    salted_password = salt + password
    hashed_password = hashlib.sha256(salted_password.encode('utf-8')).hexdigest()
    return hashed_password

def verify_password(stored_password_hash, provided_password, salt):
    """Verifies a provided password against a stored hash and salt."""
    return stored_password_hash == hash_password(provided_password, salt)

JWT_SECRET = 'THIS_IS_A_DEMO_SECRET_KEY_CHANGE_ME'
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_SECONDS = 60 * 60 * 24  # 24 hours

def generate_jwt_token(passenger_id, username, role):
    """
    Generate a JWT token for the user with expiration.
    """
    payload = {
        'passenger_id': passenger_id,
        'username': username,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    # PyJWT >= 2.x returns a str, <2.x returns bytes
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token

def verify_token(token):
    """
    Verify a JWT token and return the payload if valid, else None.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None