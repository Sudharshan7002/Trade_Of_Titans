import os

# This must be configured before importing the app, whose database engine is created at import time.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-secret-key"
