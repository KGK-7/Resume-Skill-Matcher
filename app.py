from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

from database.db_connect import get_db_connection
from utils.resume_parser import extract_text_from_pdf, extract_text_from_docx, clean_and_extract_keywords
from utils.data_storage import save_result

app = Flask(__name__)
CORS(app)

# Upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ✅ API: Upload Resume + Match JD
@app.route('/upload', methods=['POST'])
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400
            
        file = request.files['resume']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if not allowed_file(file.filename):
            return jsonify({"error": "Only PDF or DOCX files are allowed"}), 400

        name = request.form.get('name')
        email = request.form.get('email')
        role = request.form.get('role')
        job_desc = request.form.get('job_desc')

        if not all([name, email, role, job_desc]):
            return jsonify({"error": "Missing required fields"}), 400

        # Save resume with secure filename
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Extract text
        if file.filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(filepath)
        elif file.filename.endswith(".docx"):
            resume_text = extract_text_from_docx(filepath)
        else:
            return jsonify({"error": "Only PDF or DOCX allowed"}), 400

        # Extract keywords
        resume_words = clean_and_extract_keywords(resume_text)
        jd_words = clean_and_extract_keywords(job_desc)

        matches = resume_words.intersection(jd_words)
        match_score = len(matches)

        # Store in DB
        db = get_db_connection()
        cursor = db.cursor()
        sql = "INSERT INTO candidates (name, email, role, skills, match_score) VALUES (%s, %s, %s, %s, %s)"
        values = (name, email, role, ", ".join(list(matches)), match_score)
        cursor.execute(sql, values)
        db.commit()
        cursor.close()
        db.close()

        # Respond as JSON
        response_data = {
            "name": name,
            "email": email,
            "role": role,
            "matched_keywords": list(matches),
            "match_score": match_score
        }

        # Save result to JSON file
        save_result(response_data)

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ API: Get All Candidates
@app.route('/candidates', methods=['GET'])
def get_candidates():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM candidates")
    result = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(result)

@app.route('/candidates/filter', methods=['GET'])
def filter_candidates():
    role = request.args.get('role', '')
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    if role:
        cursor.execute("SELECT * FROM candidates WHERE role = %s", (role,))
    else:
        cursor.execute("SELECT * FROM candidates")
        
    result = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(result)

@app.route('/candidates/<int:id>', methods=['DELETE'])
def delete_candidate(id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM candidates WHERE id = %s", (id,))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"success": True, "message": "Candidate deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
