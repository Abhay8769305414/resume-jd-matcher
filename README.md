# Resume-JD Matcher (Senior-Level Implementation)

A high-performance Node.js REST API designed to parse PDF résumés and match them against multiple Job Descriptions (JDs) using rule-based parsing and optimized matching algorithms.

## 🚀 Key Features

- **Set-Based Matching (O(1))**: Optimized skill lookup using `Set` data structures instead of `Array.includes`, significantly reducing time complexity for large résumés.
- **Startup JD Caching**: Job Descriptions are parsed exactly once during server initialization. This eliminates redundant file I/O and text processing, ensuring sub-millisecond match times.
- **Intelligent Extraction**:
  - **Experience**: Handles both direct mentions (e.g., "5+ years") and date-range calculations (e.g., "Jan 2020 – Present").
  - **Salary**: Regex-based extraction for LPA (Indian), INR (₹), and USD ($) formats.
- **RESTful API**: Clean endpoint structure with health monitoring and skill discovery.
- **Memory Storage**: Uses Multer `memoryStorage` to process PDFs directly from buffers, ensuring no temporary files are written to disk.

## 📁 System Architecture

```text
/src
 ├── controllers/
 │     └── match.controller.js  # Pipeline orchestration & result sorting
 ├── services/
 │     ├── resume.parser.js      # PDF extraction & data synthesis
 │     ├── jd.parser.js          # Pre-caching JD skills
 │     ├── skill.matcher.js      # Optimized skill intersection
 │     └── score.calculator.js   # Accuracy score computation
 ├── utils/
 │     ├── skill.dictionary.js   # 40+ supported tech skills
 │     ├── salary.extractor.js   # Regex salary patterns
 │     ├── experience.extractor.js # Dual-strategy experience calculation
 │     └── text.cleaner.js       # Text normalization & cleanup
 ├── data/
 │     └── jds.json              # Sample Job Descriptions
 ├── app.js                      # Express configuration & caching logic
 └── server.js                   # Application entry point
```

## 🛠️ Setup & Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   node src/server.js
   ```

## 📡 API Documentation

### 1. Match Resume
**Endpoint**: `POST /api/match`  
**Payload**: `multipart/form-data` with field `resume` (PDF file).  
**Description**: Parses the résumé and returns matching jobs sorted by score.

### 2. Supported Skills
**Endpoint**: `GET /api/skills`  
**Description**: Returns the list of all skills recognizable by the system.

### 3. Health Check
**Endpoint**: `GET /api/health`  
**Description**: Returns server status and count of pre-cached JDs.

## 🧪 Testing with cURL

Match a resume (replace with your file path):
```powershell
curl.exe -X POST http://localhost:3000/api/match `
  -F "resume=@C:\path\to\your_resume.pdf"
```

Check health:
```powershell
curl.exe -s http://localhost:3000/api/health
```

## 📝 Matching Formula
$$ \text{Matching Score} = \left( \frac{\text{Matched JD Skills}}{\text{Total JD Skills}} \right) \times 100 $$

---
*Developed for Resume Parsing and Job Matching Assignment.*
