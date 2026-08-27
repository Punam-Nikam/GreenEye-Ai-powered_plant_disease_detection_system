# routes/scan.py
# Updated with:
#   - Language support (English, Hindi, Marathi)
#   - Better prompt asking for symptoms, treatment steps, fertilizers

import os
import json
from google import genai
from google.genai import types

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from config import GEMINI_KEY


def create_scan_blueprint(mysql):

    client = genai.Client(api_key=GEMINI_KEY)
    scan_bp = Blueprint("scan", __name__, url_prefix="/api/scan")

    @scan_bp.route("/analyse", methods=["POST"])
    @jwt_required()
    def analyse():

        user_id = int(get_jwt_identity())

        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image_file = request.files["image"]

        if image_file.filename == "":
            return jsonify({"error": "No image selected"}), 400

        # Read language from form data
        # React sends "english", "hindi", or "marathi"
        language = request.form.get("language", "english")

        image_bytes = image_file.read()
        mime_type   = image_file.content_type or "image/jpeg"

        # Better prompt — asks for symptoms, numbered steps,
        # fertilizer recommendations with buy search terms
        prompt = f"""
            You are an expert plant pathologist and agricultural scientist.
            Analyse this plant image carefully.

            CRITICAL INSTRUCTION: You MUST respond ENTIRELY in {language} language.
            Every single word in every field must be in {language}.
            Do NOT use English anywhere if the language is not English.
            Disease names can be in English but all descriptions must be in {language}.

            Respond ONLY with a valid JSON object. No text before or after.

            {{
                "disease": "disease name",
                "severity": "High or Medium or Low or None",
                "cause": "explanation in {language} language",
                "symptoms": "symptoms description in {language} language",
                "treatment": [
                    "पहला चरण in {language}",
                    "दूसरा चरण in {language}",
                    "तीसरा चरण in {language}"
                ],
                "prevention": [
                    "tip 1 in {language}",
                    "tip 2 in {language}",
                    "tip 3 in {language}"
                ],
                "fertilizers": [
                    {{
                        "name": "product name",
                        "use": "usage instructions in {language}",
                        "buy_search": "product search term in English"
                    }},
                    {{
                        "name": "product name",
                        "use": "usage instructions in {language}",
                        "buy_search": "product search term in English"
                    }}
                ],
                "is_plant": true
            }}

            REMEMBER: All text values except disease name and buy_search must be written in {language} language only.
            """

        try:
            gemini_response = client.models.generate_content(
            model="models/gemini-3.1-flash-lite",
                contents=[
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=mime_type,
                    ),
                    prompt
                ]
            )

            raw_text = gemini_response.text.strip()

            # Remove markdown code fences if Gemini added them
            if raw_text.startswith("```"):
                lines    = raw_text.split("\n")
                raw_text = "\n".join(lines[1:-1])

            result = json.loads(raw_text)

        except Exception as gemini_error:
            print("GEMINI ERROR:", str(gemini_error))
            return jsonify({"error": str(gemini_error)}), 500

        # Save to MySQL
        try:
            cursor = mysql.connection.cursor()
            cursor.execute(
            """
            INSERT INTO scans (user_id, disease, severity, full_result, image_name)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                user_id,
                result.get("disease",  "Unknown"),
                result.get("severity", "Unknown"),
                raw_text,           
                image_file.filename
            )
        )
            mysql.connection.commit()
            cursor.close()

        except Exception as db_error:
            print("DB ERROR:", str(db_error))
            # Don't fail the request if only DB save fails
            # User still gets their result

        return jsonify({
            "success":     True,
            "disease":     result.get("disease",     "Unknown"),
            "severity":    result.get("severity",    "Unknown"),
            "cause":       result.get("cause",       ""),
            "symptoms":    result.get("symptoms",    ""),
            "treatment":   result.get("treatment",   []),
            "prevention":  result.get("prevention",  []),
            "fertilizers": result.get("fertilizers", []),
            "is_plant":    result.get("is_plant",    True)
        }), 200


    @scan_bp.route("/history", methods=["GET"])
    @jwt_required()
    def history():

        user_id = int(get_jwt_identity())
        cursor  = mysql.connection.cursor()

        cursor.execute(
            """
            SELECT id, disease, severity, image_name, scanned_at
            FROM scans
            WHERE user_id = %s
            ORDER BY scanned_at DESC
            """,
            (user_id,)
        )

        rows = cursor.fetchall()
        cursor.close()

        scans = []
        for row in rows:
            scans.append({
                "id":         row[0],
                "disease":    row[1],
                "severity":   row[2],
                "image_name": row[3],
                "scanned_at": str(row[4])
            })

        return jsonify({"scans": scans}), 200

    return scan_bp