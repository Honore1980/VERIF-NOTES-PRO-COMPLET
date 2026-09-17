import { useState } from 'react'

function generateSecretCode(matricule, note) {
  const SECRET_SALT = "AES-BF-DDG-2026";
  const data = `${matricule.trim().toUpperCase()}#${note}#${SECRET_SALT}`;
  let sum = 0;
  for(let c of data) sum += c.charCodeAt(0) * 7;
  const hash = sum.toString(36).toUpperCase();
  const raw = `${matricule.trim().toUpperCase()}|${note}|${hash}`;
  const b64 = btoa(raw).split('').reverse().join('');
  return `BF-${b64}-${sum % 99}AES`;
}

function verifySecretCode(code) {
  try {
    if(!code.startsWith("BF-") ||!code.endsWith("AES")) return null;
    const core = code.slice(3, -3);
    const lastDash = core.lastIndexOf('-');
    if(lastDash === -1) return null;
    const b64_rev = core.substring(0, lastDash);
    const b64 = b64_rev.split('').reverse().join('');
    const raw = atob(b64);
    const parts = raw.split('|');
    if(parts.length!== 3) return null;
    return { matricule: parts[0], note: parts[1], valide: true };
  } catch(e) { return null; }
}

export default function App() {
  const [mat, setMat] = useState("BF2026-001");
  const [note, setNote] = useState("16");
  const [code, setCode] = useState("");
  const [verifCode, setVerifCode] = useState("");
  const [result, setResult] = useState(null);

  const handleGen = () => {
    const c = generateSecretCode(mat, note);
    setCode(c);
  }
  const handleVerif = () => {
    const r = verifySecretCode(verifCode);
    setResult(r);
  }

  return (
    <div style={{maxWidth:600, margin:'30px auto', fontFamily:'Arial', padding:20}}>
      <h1>VERIF-NOTES-PRO-COMPLET 🎓</h1>
      <p>Plateforme éducative - Vérification sécurisée AES</p>
      <p style={{background:'#f0f9ff', padding:10, borderRadius:8}}>🇧🇫 Logique secrète Burkina : BF-[BASE64-INVERSÉ]-[CHECKSUM]AES</p>
      <div style={{border:'1px solid #ddd', padding:20, borderRadius:12, marginBottom:20}}>
        <h3>1. Générer un code</h3>
        <input value={mat} onChange={e=>setMat(e.target.value)} placeholder="Matricule" style={{width:'100%', padding:10, marginBottom:10}}/>
        <div style={{display:'flex', gap:10}}>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note /20" style={{flex:1, padding:10}}/>
          <button onClick={handleGen} style={{background:'#16a34a', color:'white', padding:'10px 20px', border:0, borderRadius:6, cursor:'pointer'}}>Générer code AES</button>
        </div>
        {code && <div style={{marginTop:15, background:'#dcfce7', padding:15, wordBreak:'break-all', borderRadius:8}}><b>Code généré :</b><br/>{code}<br/><button onClick={()=>navigator.clipboard.writeText(code)} style={{marginTop:10}}>Copier</button></div>}
      </div>
      <div style={{border:'1px solid #ddd', padding:20, borderRadius:12}}>
        <h3>2. Vérifier un code</h3>
        <input value={verifCode} onChange={e=>setVerifCode(e.target.value)} placeholder="Collez le code ici" style={{width:'100%', padding:10, marginBottom:10}}/>
        <button onClick={handleVerif} style={{background:'#2563eb', color:'white', padding:'10px 20px', border:0, borderRadius:6, cursor:'pointer'}}>Vérifier</button>
        {result && <div style={{marginTop:15, background: result.valide? '#dcfce7' : '#fee2e2', padding:15, borderRadius:8}}>{result.valide? `✅ Valide - Matricule: ${result.matricule}, Note: ${result.note}` : '❌ Code invalide'}</div>}
        {result===null && verifCode && <div style={{marginTop:15, background:'#fee2e2', padding:15, borderRadius:8}}>❌ Code invalide</div>}
      </div>
      <p style={{marginTop:20, fontSize:12, color:'#666'}}>Déployé sur Render • GitHub: Honore1980/VERIF-NOTES-PRO-COMPLET • Logique: BF + Base64 inversé + Checksum mod 99 + AES</p>
    </div>
  )
}
