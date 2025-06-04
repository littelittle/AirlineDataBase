import hashlib
import os

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

def generate_example_token(passenger_id, username):
    # TODO: This is NOT a secure token. Replace with actual JWT generation.
    return f"toy_token_for_user_{username}_id_{passenger_id}"