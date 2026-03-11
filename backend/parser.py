import pypdf
import docx
import io

def extract_text_from_pdf(file_content: bytes) -> str:
    pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_content: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_content))
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def parse_cv(filename: str, file_content: bytes) -> str:
    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file_content)
    elif filename.endswith(".docx"):
        return extract_text_from_docx(file_content)
    else:
        raise ValueError("Unsupported file format. Please upload PDF or DOCX.")
