# SR University Academic Project Report: Customer Relationship Management (CRM) System

This directory contains the complete, submission-ready LaTeX project for the **Customer Relationship Management (CRM) System** capstone report for the course **DevOps & Full Stack Development (23CS102PE405)** at **SR University**, School of Computer Science & Artificial Intelligence.

---

## 📁 Directory Structure

```text
CRM_System_Documentation/
├── main.tex                    # Master LaTeX file (compiles entire report)
├── references.bib              # IEEE-format bibliography (20+ citations)
├── README.md                   # This instruction guide
├── chapters/
│   ├── preliminary.tex         # Cover page, Certificate, Declaration, Acknowledgement, Abstract, Abbreviations
│   ├── ch1_introduction.tex    # Chapter 1: Introduction, Problem Statement, Objectives, Scope
│   ├── ch2_requirements.tex    # Chapter 2: Stakeholders, FR-01 to FR-18, NFRs, Feasibility
│   ├── ch3_system_design.tex   # Chapter 3: 3-Tier Architecture, TikZ Diagrams, ERD, DFD, UML Workflows
│   ├── ch4_implementation.tex  # Chapter 4: Frontend, 12 Screens, Backend REST API, Security, Schemas
│   ├── ch5_testing.tex         # Chapter 5: Test Strategy, Test Cases (TC-01 to TC-20), E2E Test Outputs
│   ├── ch6_devops_deployment.tex # Chapter 6: Git, Vercel, Render, MongoDB Atlas, Docker, K8s
│   ├── ch7_conclusion.tex      # Chapter 7: Achievements, Learning Outcomes, Limitations, Future Work
│   └── appendices.tex          # Appendices A to G (Install, Execution, API Ref, Schemas, Diagrams)
├── figures/
│   └── sru_logo.png            # Official SR University emblem for Cover and Certificate
└── screenshots/                # Application mockups and visual module frames
```

---

## 🚀 How to Upload & Compile in Overleaf

### Step 1: Compress the Folder to a ZIP File
On Windows:
1. Right-click the `CRM_System_Documentation` folder.
2. Select **Compress to ZIP file** (or **Send to > Compressed (zipped) folder**).
3. Name it `CRM_System_Documentation.zip`.

### Step 2: Upload to Overleaf
1. Go to [https://www.overleaf.com/](https://www.overleaf.com/) and log in (or create an account).
2. Click **New Project** in the top left corner.
3. Select **Upload Project**.
4. Drag and drop or browse to select your `CRM_System_Documentation.zip`.

### Step 3: Overleaf Project Settings
Overleaf will automatically extract and open the project:
1. Click the **Menu** button in the top left corner of Overleaf.
2. Confirm the following settings:
   - **Compiler:** `pdfLaTeX` (default)
   - **TeX Live version:** `2024` (or `2023`)
   - **Main document:** `main.tex`
3. Click the green **Recompile** button.

Your complete ~45–50 page academic report with clickable Table of Contents, Lists of Figures/Tables, TikZ vector diagrams, code listings, and IEEE citations will compile cleanly with 0 errors!

---

## ✍️ Customizing Your Details

Open `chapters/preliminary.tex` and find the placeholders to add your personal information:
- Replace `[ENTER YOUR NAME]` with your full name.
- Replace `[ENTER YOUR ROLL NUMBER]` with your SR University Hall Ticket Number (e.g., `2303A540XX`).
- Replace `[HOD NAME]` with your Department Head's name.
- Replace `[EXTERNAL EXAMINER]` during final defense evaluation.

---

## 🌐 Verified Project & Cloud Deployment URLs

All URLs referenced throughout the report are actively configured and verified:
- **GitHub Repository:** [https://github.com/Kowshik1759/CRM-System](https://github.com/Kowshik1759/CRM-System)
- **Frontend Deployment (Vercel):** [https://crm-system-sable-delta.vercel.app](https://crm-system-sable-delta.vercel.app)
- **Backend Deployment (Render):** [https://crm-system-ea6d.onrender.com](https://crm-system-ea6d.onrender.com)
- **Backend Health Check:** [https://crm-system-ea6d.onrender.com/health](https://crm-system-ea6d.onrender.com/health)
- **Cloud Database:** MongoDB Atlas (`crm_db`)
