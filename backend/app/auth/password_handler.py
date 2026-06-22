"""
Password hashing utilities using bcrypt directly.

We NEVER store plaintext passwords. `hash_password` is called once at signup;
`verify_password` is called at login to check the submitted password against
the stored hash, without ever decrypting the hash (bcrypt is one-way).

Note: we call the `bcrypt` library directly rather than via passlib's
CryptContext. Newer bcrypt (4.x) releases removed an internal attribute
passlib's self-test relies on, causing spurious "password cannot be longer
than 72 bytes" errors even for short passwords. Calling bcrypt directly
avoids that incompatibility entirely and is one less layer of abstraction.
"""

import bcrypt

# bcrypt has a hard limit of 72 bytes per password. We truncate defensively
# (a password this long is already far beyond reasonable, so truncation
# has no real-world security impact, but prevents a 500 error).
_MAX_PASSWORD_BYTES = 72


def hash_password(plain_password: str) -> str:
    password_bytes = plain_password.encode("utf-8")[:_MAX_PASSWORD_BYTES]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")[:_MAX_PASSWORD_BYTES]
    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))

