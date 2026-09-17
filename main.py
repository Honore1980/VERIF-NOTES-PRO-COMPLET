from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64, os, json

app = FastAPI(title="VERIF-NOTES-PRO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("AES_KEY", "VERIF-NOTES-2024-32-BYTES-KEY !!")[:32].encode()

class NoteRequest(BaseModel):
    matricule: str
    note: float

class VerifyRequest(BaseModel):
    code: str

def encrypt_note(data: str) -> str:
    cipher = AES.new(SECRET_KEY, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(data.encode(), AES.block_size))
    iv = base64.b64encode(cipher.iv).decode()
    ct = base64.b64encode(ct_bytes).decode()
    return f"{iv}:{ct}"

def decrypt_note(code: str) -> str:
    try:
        iv_b64, ct_b64 = code.split(":")
        iv = base64.b64decode(iv_b64)
        ct = base64.b64decode(ct_b64)
        cipher = AES.new(SECRET_KEY, AES.MODE_CBC, iv)
        pt = unpad(cipher.decrypt(ct), AES.block_size)
        return pt.decode()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Code invalide: {str(e)}")

@app.get("/")
def root():
    return {"status": "VERIF-NOTES-PRO en ligne", "version": "2.0"}

@app.post("/generer")
def generer(req: NoteRequest):
    data = json.dumps({"matricule": req.matricule, "note": req.note})
    code = encrypt_note(data)
    return {"code": code, "matricule": req.matricule, "note": req.note}

@app.post("/verifier")
def verifier(req: VerifyRequest):
    data_str = decrypt_note(req.code)
    data = json.loads(data_str)
    return {"valide": True, "matricule": data["matricule"], "note": data["note"]}

# Compatibilité avec frontend qui appelle /generate
@app.post("/generate")
def generate_alias(req: NoteRequest):
    return generer(req)

@app.post("/verify")
def verify_alias(req: VerifyRequest):
    return verifier(req)
