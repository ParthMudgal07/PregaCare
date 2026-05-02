from fpdf import FPDF

class PregaCarePDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 20)
        self.set_text_color(79, 70, 229) # Indigo
        self.cell(0, 15, 'PregaCare Project Documentation', ln=True, align='C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 16)
        self.set_text_color(31, 41, 55) # Slate-800
        self.cell(0, 10, title, ln=True)
        self.ln(2)
        # Line break
        self.set_draw_color(229, 231, 235)
        self.line(self.get_x(), self.get_y(), self.get_x() + 190, self.get_y())
        self.ln(5)

    def chapter_body(self, body):
        self.set_font('helvetica', '', 12)
        self.set_text_color(55, 65, 81) # Slate-700
        self.multi_cell(0, 7, body)
        self.ln(5)

    def sub_chapter_title(self, title):
        self.set_font('helvetica', 'B', 13)
        self.set_text_color(79, 70, 229)
        self.cell(0, 8, title, ln=True)
        self.ln(2)

pdf = PregaCarePDF()
pdf.add_page()

# --- Project Overview ---
pdf.chapter_title('1. Project Overview')
pdf.chapter_body(
    "PregaCare is an AI-powered maternal health support system designed to provide personalized "
    "risk assessment and clinical guidance for pregnant women in India. It combines machine learning "
    "for clinical risk prediction with regional health infrastructure data (NFHS-5) to provide a "
    "holistic safety report."
)

# --- Technologies Used ---
pdf.chapter_title('2. Technology Stack')
pdf.sub_chapter_title('Backend')
pdf.chapter_body(
    "- FastAPI: Modern, high-performance web framework for the REST API.\n"
    "- Python: Primary language for data processing and model inference.\n"
    "- Uvicorn: ASGI server for running the FastAPI application.\n"
    "- scikit-learn & XGBoost: Libraries used for the Stacking Ensemble Model.\n"
    "- Pandas & NumPy: Data manipulation and numerical calculations."
)
pdf.sub_chapter_title('Frontend')
pdf.chapter_body(
    "- React.js: UI framework for building a responsive user interface.\n"
    "- Vite: Next-generation frontend tooling for fast development.\n"
    "- Tailwind CSS: Utility-first CSS framework for premium styling.\n"
    "- Framer Motion: Animation library for smooth UI transitions.\n"
    "- Lucide React: Modern icon library."
)
pdf.sub_chapter_title('AI & Data')
pdf.chapter_body(
    "- OpenRouter API: Gateway used to access Gemini 2.0 Flash Lite.\n"
    "- RAG (Retrieval-Augmented Generation): System to inject clinical guidelines into AI context.\n"
    "- NFHS-5 Dataset: Source for regional healthcare infrastructure metrics."
)

# --- Algorithms & Calculations ---
pdf.chapter_title('3. Algorithms & Calculations')

pdf.sub_chapter_title('Clinical Risk Prediction (Stacking Ensemble)')
pdf.chapter_body(
    "The core clinical risk is predicted using a Stacking Model which ensembles multiple "
    "base learners (Random Forest, XGBoost, etc.) to achieve higher accuracy. It processes "
    "six primary vitals: Age, Systolic BP, Diastolic BP, Blood Sugar, Body Temp, and Heart Rate."
)

pdf.sub_chapter_title('Regional Safety Index (TOPSIS)')
pdf.chapter_body(
    "The TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) algorithm "
    "was used to rank Indian districts based on healthcare infrastructure data from the "
    "National Family Health Survey (NFHS-5). This score (0 to 1) represents the relative "
    "safety of the patient's location."
)

pdf.sub_chapter_title('Integrated Risk Score Formula')
pdf.chapter_body(
    "The final 'PregaCare Index' is a weighted combination of clinical health and regional safety:\n\n"
    "Combined Score = (Clinical_Risk * 0.75) + ((1 - Safety_Score) * 100 * 0.25)\n\n"
    "This weighting prioritizes the patient's immediate clinical vitals (75%) while "
    "acknowledging that a lack of local medical infrastructure adds significant risk (25%)."
)

# --- Risk Categorization ---
pdf.chapter_title('4. Risk Categorization')
pdf.chapter_body(
    "- Low Risk (0 - 35): Routine care and standard checkups recommended.\n"
    "- Mid Risk (36 - 70): Moderate concern; increased monitoring and doctor consultation advised.\n"
    "- High Risk (71 - 100): Immediate medical attention and specialist consultation required."
)

# --- Key Terms & Naming Conventions ---
pdf.chapter_title('5. Keywords & Naming Conventions')
pdf.chapter_body(
    "- 'assessor': Reference to the PregaCareFinalAssessment class.\n"
    "- 'engine': Reference to the PregaCareAIEngine (RAG system).\n"
    "- 'vitals': The clinical data object (Age, BP, BS, etc.).\n"
    "- 'risk_band': The categorical label (Low, Mid, High).\n"
    "- 'safety_index': The normalized TOPSIS score for a district."
)

# Output
pdf_output_path = 'PregaCare_Project_Documentation.pdf'
pdf.output(pdf_output_path)
print(f"PDF generated successfully: {pdf_output_path}")
