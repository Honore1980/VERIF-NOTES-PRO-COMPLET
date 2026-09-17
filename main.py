from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64, os

app = FastAPI(title="VERIF-NOTES-PRO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clé AES 32 bytes - à mettre en variable d'env sur Render
SECRET_KEY = os.getenv("AES_KEY", "VERIF-NOTES-2024-32-BYTES-KEY!!")[:32].encode()

def encrypt_note(text: str) -> str:
    cipher = AES.new(SECRET_KEY, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(text.encode(), AES.block_size))
    return base64.b64encode(cipher.iv + ct_bytes).decode()

def decrypt_note(enc: str) -> str:
    try:
        data = base64.b64decode(enc)
        iv, ct = data[:16], data[16:]
        cipher = AES.new(SECRET_KEY, AES.MODE_CBC, iv)
        return unpad(cipher.decrypt(ct), AES.block_size).decode()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class NoteIn(BaseModel):
    matricule: str
    note: str

class VerifyIn(BaseModel):
    code: str

# Base en mémoire (remplacez par DB plus tard)
DB = {}

@app.get("/")
def root():
    return {"status": "VERIF-NOTES-PRO en ligne", "version": "1.0"}

@app.post("/api/generer")
def generer(payload: NoteIn):
    code = encrypt_note(f"{payload.matricule}|{payload.note}")
    DB[payload.matricule] = {"note": payload.note, "code": code}
    return {"matricule": payload.matricule, "code_verif": code, "lien": f"/verif/{code}"}

@app.post("/api/verifier")
def verifier(payload: VerifyIn):
    try:
        decoded = decrypt_note(payload.code)
        matricule, note = decoded.split("|")
        return {"valide": True, "matricule": matricule, "note": note}
    except:
        return {"valide": False, "message": "Code invalide ou falsifié"}

@app.get("/api/notes")
def liste():
    return DB
