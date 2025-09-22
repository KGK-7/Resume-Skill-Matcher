# Skills Matcher - Mini ATS System

A modern Applicant Tracking System (ATS) that helps match candidate resumes with job descriptions. The system analyzes resumes, extracts relevant skills, and provides a match score based on job requirements.

##  Features

- Resume parsing (PDF and DOCX support)
- Skill extraction and matching
- Match score calculation
- Candidate management
- Real-time filtering
- Interactive drag-and-drop interface
- Custom role support

##  Prerequisites

- Python 3.x
- MySQL Database
- JavaScript (for running the frontend)

##  Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd skills-matcher-mini-ats
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up the MySQL database:
```sql
CREATE DATABASE skills_matcher;
USE skills_matcher;

CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    skills TEXT,
    match_score INT
);
```

4. Configure database connection:
Update `database/db_connect.py` with your MySQL credentials.

##  Running the Application

1. Start the Flask backend:
```bash
python app.py
```

2. Open `static/index.html` in a web browser or serve it using a local server.


## Project Structure

```
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── database/
│   └── db_connect.py     # Database connection utilities
├── static/
│   ├── index.html        # Frontend HTML
│   ├── index.css         # Styles
│   └── script.js         # Frontend JavaScript
├── utils/
│   ├── resume_parser.py  # Resume parsing utilities
│   └── data_storage.py   # Data persistence utilities
├── uploads/              # Uploaded resumes storage
└── tests/               # Test files
```

### Upload Resume
```http
POST /upload
```
- **Purpose**: Upload resume and match with job description
- **Content-Type**: multipart/form-data
- **Body**:
  - `resume` (file) - PDF or DOCX file
  - `name` (string) - Candidate name
  - `email` (string) - Candidate email
  - `role` (string) - Job role
  - `job_desc` (string) - Job description
- **Response**:
```json
{
    "name": "string",
    "email": "string",
    "role": "string",
    "matched_keywords": ["skill1", "skill2"],
    "match_score": number
}
```

### Get All Candidates
```http
GET /candidates
```
- **Purpose**: Retrieve all candidates
- **Response**: Array of candidate objects

### Filter Candidates
```http
GET /candidates/filter?role=role_name
```
- **Purpose**: Filter candidates by role
- **Query Parameters**:
  - `role` (optional) - Filter by specific role
- **Response**: Array of filtered candidate objects

### Delete Candidate
```http
DELETE /candidates/{id}
```
- **Purpose**: Delete a candidate
- **Parameters**:
  - `id` - Candidate ID
- **Response**:
```json
{
    "success": boolean,
    "message": "string"
}
```

## Program Flow

1. **Resume Upload**:
   - User uploads resume and fills form
   - Backend validates file format
   - Resume text is extracted

2. **Skill Extraction**:
   - Resume text is processed
   - Keywords are extracted
   - Skills are identified

3. **Matching Process**:
   - Job description is analyzed
   - Skills are compared
   - Match score is calculated

4. **Data Storage**:
   - Results saved to database
   - JSON backup created
   - Response sent to frontend

5. **Candidate Management**:
   - List view with filtering
   - Real-time updates
   - Delete functionality

## Frontend Components

1. **Upload Form**:
   - Drag-and-drop zone
   - File selection
   - Form validation

2. **Results Display**:
   - Match score
   - Matched skills
   - Candidate details

3. **Candidates List**:
   - Filterable grid
   - Role-based filtering
   - Delete functionality

## Error Handling

- File format validation
- Required field validation
- Database connection errors
- Parse failures
- API error responses


## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Contact

For any queries or support, please reach out to [tamilangokul58@gmail.com]

---