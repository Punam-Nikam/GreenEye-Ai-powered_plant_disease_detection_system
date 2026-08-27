# routes/auth.py
# This file handles two things:
#   1. Register  → POST /api/auth/register
#   2. Login     → POST /api/auth/login
#
# We keep this in a separate file to stay organised.
# app.py imports this and plugs it into the main server.

from flask import Blueprint, request, jsonify
# Blueprint  = a group of routes. Like a mini Flask app.
#              We create one here and register it in app.py.
# request    = Flask object that holds everything the client sent.
#              request.get_json() reads the JSON body from React.
# jsonify()  = converts a Python dict into a proper JSON response.
#              Always use this to send data back to React.

from flask_jwt_extended import create_access_token
# create_access_token() generates a JWT token string.
# We call this after successful login.
# The token is sent to React, which stores it in localStorage.


def create_auth_blueprint(mysql, bcrypt):
    # We receive mysql and bcrypt from app.py.
    # This way we use the same database connection
    # that was set up in app.py - not a new one.

    # Create a Blueprint named "auth"
    # url_prefix="/api/auth" means every route here
    # automatically starts with /api/auth
    # So /register becomes /api/auth/register
    auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


    # ── REGISTER ROUTE ────────────────────────────────────
    # URL:    POST /api/auth/register
    # Receives: { "name": "...", "email": "...", "password": "..." }
    # Returns:  { "message": "..." } or { "error": "..." }

    @auth_bp.route("/register", methods=["POST"])
    def register():

        # Read the JSON that React sent in the request body
        data = request.get_json()

        # If React forgot to send JSON body, data will be None
        if not data:
            return jsonify({"error": "No data received"}), 400

        # Pull each field out of the dict
        # .get("name", "") returns "" if "name" key is missing
        # This prevents a KeyError crash
        name     = data.get("name", "").strip()
        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")
        # .strip() removes extra spaces from start/end
        # .lower() converts email to lowercase
        # so "Test@Gmail.com" and "test@gmail.com" are same

        # Validate - make sure none of the fields are empty
        if not name or not email or not password:
            # 400 = Bad Request (client sent wrong/missing data)
            return jsonify({"error": "All fields are required"}), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        # ── Open a cursor to talk to MySQL ────────────────
        # cursor = a tool to run SQL queries
        # Think of it like opening a terminal to MySQL
        cursor = mysql.connection.cursor()

        # Check if this email already exists in the database
        # %s is a placeholder - MySQLdb replaces it with the value safely
        # This prevents SQL injection attacks
        # (where attacker puts SQL code in the email field)
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
            # (email,) is a tuple - the trailing comma is REQUIRED
            # Without comma: (email) is just email in parentheses, not a tuple
            # With comma:    (email,) is a tuple with one item
        )

        # fetchone() gets the first matching row
        # Returns a tuple like (5,) if found, or None if not found
        existing = cursor.fetchone()

        if existing:
            cursor.close()
            # 409 = Conflict (the resource already exists)
            return jsonify({"error": "Email is already registered"}), 409

        # ── Hash the password ─────────────────────────────
        # generate_password_hash("mypassword") returns something like:
        # b"$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
        # The b prefix means it's bytes not a string
        # .decode("utf-8") converts bytes to a regular Python string
        # so MySQL can store it as text
        hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

        # ── Insert new user into the database ────────────
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed_pw)
            # We insert the HASHED password, never the plain one
        )

        # commit() SAVES the insert permanently to MySQL
        # Without commit(), the insert is like writing in pencil
        # When cursor closes, the insert disappears
        # commit() makes it permanent (like writing in ink)
        mysql.connection.commit()

        # cursor.lastrowid = the auto-generated id of the new row
        new_id = cursor.lastrowid

        cursor.close()

        # 201 = Created (new resource was successfully created)
        return jsonify({
            "message": "Account created successfully",
            "user_id": new_id
        }), 201


    # ── LOGIN ROUTE ───────────────────────────────────────
    # URL:    POST /api/auth/login
    # Receives: { "email": "...", "password": "..." }
    # Returns:  { "token": "...", "name": "..." } or { "error": "..." }

    @auth_bp.route("/login", methods=["POST"])
    def login():

        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        cursor = mysql.connection.cursor()

        # Find the user row that matches this email
        # We select id, name, and password (the hash)
        cursor.execute(
            "SELECT id, name, password FROM users WHERE email = %s",
            (email,)
        )

        # fetchone() returns:
        #   (1, "Raj", "$2b$12$...hashedpassword...")  if found
        #   None  if no user with that email exists
        user = cursor.fetchone()
        cursor.close()

        # User not found
        if not user:
            # We say "email or password" intentionally
            # If we said "email not found", attacker knows
            # the email exists just by trying passwords
            return jsonify({"error": "Invalid email or password"}), 401
            # 401 = Unauthorized

        # Unpack the tuple into named variables
        # user[0] = id, user[1] = name, user[2] = hashed password
        user_id       = user[0]
        user_name     = user[1]
        stored_hash   = user[2]

        # ── Check the password ────────────────────────────
        # check_password_hash does this internally:
        #   1. Takes the plain password the user just typed
        #   2. Hashes it using the same algorithm and salt
        #   3. Compares the two hashes
        #   4. Returns True if they match, False if not
        # We never "unhash" - we compare hashes
        password_correct = bcrypt.check_password_hash(stored_hash, password)

        if not password_correct:
            return jsonify({"error": "Invalid email or password"}), 401

        # ── Create a JWT token ────────────────────────────
        # identity = something unique to identify this user
        # We use the user's id from the database
        # str() converts the integer to a string
        # because JWT tokens require string identity
        token = create_access_token(identity=str(user_id))

        # Send the token and name back to React
        # React will store token in localStorage
        # and send it with every future request
        return jsonify({
            "token":   token,
            "name":    user_name,
            "user_id": user_id
        }), 200
        # 200 = OK (request succeeded)


    # Return the blueprint so app.py can register it
    return auth_bp