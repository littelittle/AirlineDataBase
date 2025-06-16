import hashlib
import os
import pyrootutils
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

def generate_jwt_token(passenger_id, username, role):
    # TODO: This is NOT a secure token. Replace with actual JWT generation.
    return f"toy_token_for_user_{username}_id_{passenger_id}_role_{role}"

def verify_token(token):
    """
    Dummy token verification. Replace with real JWT or session validation.
    Returns a dict like {'role': 'admin'} if valid, else None.
    """
    # Example: parse your toy token
    if token.startswith("toy_token_for_user_"):
        # crude parsing, for demonstration
        try:
            parts = token.split("_")
            username = parts[4]
            passenger_id = parts[6]
            role = parts[8]
            return {"username": username, "passenger_id": passenger_id, "role": role}
        except Exception:
            return None
    return None