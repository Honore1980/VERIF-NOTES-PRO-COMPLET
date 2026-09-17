import { useState } from 'react'

function calcChecksum(mat, note){
  const s = (mat + note + "AES-BF-DDG-2026").toUpperCase();
  let sum = 0;
  for(let c of s) sum += c.charCodeAt(0);
  return (sum % 97).toString().padStart(2,'0');
}

function generateSecretCode(mat, note){
  const m = mat.trim().toUpperCase();
  const n = note.trim();
  const chk = calcChecksum(m, n);
  return `BF-${m}-${n}-${chk}-AES`;
}

function verifySecretCode(code){
  try{
    const clean = code.trim().toUpperCase();
    if(!clean.startsWith("BF-") || !clean.endsWith("-AES")) return null;
    const core = clean.slice(3, -4);
    const parts = core.split('-');
    if(parts.length < 4) return null;
    const chk = parts.pop();
    const note = parts.pop();
    const matricule = parts.join('-');
    const expected = calcChecksum(matricule, note);
    if(chk !== expected) return null;
    return { matricule, note, valide: true };
  }catch(e){
    return null;
  }
}

export default function App(){
  const [mat,setMat]=useState("BF2026-001");
  const [note,setNote]=useState("16");
  const [code,setCode]=useState("");
  const [verifCode,setVerifCode]=useState("");
  const [result,setResult]=useState(null);

  const handleGen = () => {
    const c = generateSecretCode(mat, note);
    setCode(c);
    setVerifCode(c);
    setResult({ matricule: mat.trim().toUpperCase(), note: note.trim(), valide: true });
  }

  const handleVerif = () => {
    setResult(verifySecretCode(verifCode));
  }

  return(
    <div style={{maxWidth:600,margin:'30px auto',fontFamily:'Arial',padding:20}}>
      <h1>VERIF-NOTES-PRO-COMPLET</h1>
      <p style={{background:'#f0f9ff',padding:10,borderRadius:8}}>BF Logique secrete : BF-MATRICULE-NOTE-CHECKSUM-AES | Sel: AES-BF-DDG-2026</p>
      
      <div style={{border:'1px solid #ddd',padding:20,borderRadius:12,marginBottom:20}}>
        <h3>1. Generer un code</h3>
        <input value={mat} onChange={e=>setMat(e.target.value)} placeholder="Matricule ex: BF2026-001" style={{width:'100%',padding:10,marginBottom:10}}/>
        <div style={{display:'flex',gap:10}}>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note /20" style={{flex:1,padding:10}}/>
          <button onClick={handleGen} style={{background:'#16a34a',color:'white',padding:'10px 20px',border:0,borderRadius:6,cursor:'pointer'}}>Generer code AES</button>
        </div>
        {code && <div style={{marginTop:15,background:'#dcfce7',padding:15,wordBreak:'break-all',borderRadius:8}}><b>Code genere :</b><br/>{code}</div>}
      </div>

      <div style={{border:'1px solid #ddd',padding:20,borderRadius:12}}>
        <h3>2. Verifier un code</h3>
        <input value={verifCode} onChange={e=>setVerifCode(e.target.value)} placeholder="Collez le code ici" style={{width:'100%',padding:10,marginBottom:10}}/>
        <button onClick={handleVerif} style={{background:'#2563eb',color:'white',padding:'10px 20px',border:0,borderRadius:6,cursor:'pointer'}}>Verifier</button>
        {result?.valide && <div style={{marginTop:15,background:'#dcfce7',padding:15,borderRadius:8}}>✅ Valide - Matricule: {result.matricule}, Note: {result.note}</div>}
        {result===null && verifCode && <div style={{marginTop:15,background:'#fee2e2',padding:15,borderRadius:8}}>❌ Code invalide</div>}
      </div>
    </div>
  )
}
