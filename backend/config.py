# config.py
# This file does ONE job: read the .env file and
# make the values available to other files.
# Other files import from here instead of reading .env directly.

import os
# os = built-in Python module to talk to the operating system
# We need it to read environment variables

from dotenv import load_dotenv
# dotenv is a package (pip install python-dotenv)
# It reads your .env file and loads every line
# into Python's environment so os.getenv() can find them

# Actually read the .env file right now
# Must be called before any os.getenv() calls below
load_dotenv()

# os.getenv("KEY") finds the value of KEY in .env
# If the key doesn't exist, it returns None
MYSQL_HOST     = os.getenv("MYSQL_HOST")
MYSQL_USER     = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DB       = os.getenv("MYSQL_DB")
JWT_SECRET     = os.getenv("JWT_SECRET")
GEMINI_KEY     = os.getenv("GEMINI_API_KEY")