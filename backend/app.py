# from flask import Flask

# from flask import request
# app = Flask(__name__)  # creates backend app

# @app.route("/")   # url endpoint
# def home():       # home() function runs when url is hit
#     return "GreenEye Backend running"

# if __name__ =="__main__":
#     app.run(debug=True)   #run() - starts server


# # fetching data
# @app.route("/test", methods=["GET"])
# def test():
#     return {"message": "GET works"}

# #send data
# @app.route("/login", methods=["POST"])
# def login():
#     data = request.json
#     return data

################################   GREENEYE BACKEND    #########################################

# app.py


from flask import Flask
from flask_cors import CORS
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from datetime import timedelta
from routes.auth import create_auth_blueprint
from routes.scan import create_scan_blueprint

from config import (
    MYSQL_HOST, MYSQL_USER,
    MYSQL_PASSWORD, MYSQL_DB, JWT_SECRET
)
# Import our values from config.py
# Instead of writing os.getenv() again here

# ── Step 1: Create the Flask app ──────────────────────────
app = Flask(__name__)
# __name__ is a Python special variable.
# It holds the name of the current file ("app" in this case).
# Flask uses it to know where your project folder is.
# Always write Flask(__name__) - don't change this.

# ── Step 2: Give Flask the MySQL connection details ────────
# flask_mysqldb reads these specific keys from app.config
# and uses them to connect to your MySQL database
app.config["MYSQL_HOST"]     = MYSQL_HOST      # where MySQL is (localhost)
app.config["MYSQL_USER"]     = MYSQL_USER      # your MySQL username
app.config["MYSQL_PASSWORD"] = MYSQL_PASSWORD  # your MySQL password
app.config["MYSQL_DB"]       = MYSQL_DB        # which database to use

# ── Step 3: JWT configuration ─────────────────────────────
# The secret key is used to "sign" tokens.
# Signing means Flask adds a secret stamp to the token.
# When the token comes back, Flask checks the stamp.
# If stamp is wrong = fake/tampered token = rejected.
app.config["JWT_SECRET_KEY"] = JWT_SECRET

# Token expires after 7 days.
# After 7 days, user must log in again.
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

# ── Step 4: Initialise all extensions ─────────────────────
# Each extension needs to know about our Flask app.
# Passing app into them links them together.
# Without this step, the extensions do nothing.
mysql  = MySQL(app)   # database connection
bcrypt = Bcrypt(app)  # password hashing
jwt    = JWTManager(app)  # token system
CORS(app)             # allow React to call this server

# ── Step 5: Register route files ──────────────────────────
# We keep routes in separate files to stay organised.
# We import the Blueprint from auth.py and register it here.
# Blueprint = a group of related routes bundled together.

auth_bp = create_auth_blueprint(mysql, bcrypt)
app.register_blueprint(auth_bp)
# After this line, /api/auth/register and /api/auth/login are live.

from routes.scan import create_scan_blueprint
scan_bp = create_scan_blueprint(mysql)
app.register_blueprint(scan_bp)

# ── Step 6: Simple test route ─────────────────────────────
# Visit http://localhost:5000/ in browser to confirm server works
@app.route("/")
def index():
    return {"message": "GreenEye backend is running"}

# ── Step 7: Start the server ──────────────────────────────
if __name__ == "__main__":
    # This block only runs when you directly run: python app.py
    # If another file imports app.py, this block is skipped.

    # debug=True: auto-restarts when you save a file.
    #             also shows detailed errors in browser.
    #             TURN OFF when deploying to production.
    # port=5000:  server runs at http://localhost:5000
    app.run(debug=True, port=5000)