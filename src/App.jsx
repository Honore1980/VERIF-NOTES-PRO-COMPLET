import React, { useState } from 'react'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App(){
  const [matricule,setMat]=useState('')
  const [note,setNote]=useState('')
  const [code,setCode]=useState('')
  const [verifCode,setVerifCode]=useState('')
  const [result,setResult]=useState(null)

  const generer = async ()=>{
    const r = await fetch(`${API}/api/generer`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({matricule,note})})
    const j = await r.json(); setCode(j.code_verif)
  }
  const verifier = async ()=>{
    const r = await fetch(`${API}/api/verifier`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:verifCode})})
    const j = await r.json(); setResult(j)
  }
  return (
    <div style={{fontFamily:'system-ui',maxWidth:700,margin:'40px auto',padding:20}}>
      <h1>VERIF-NOTES-PRO-COMPLET 🎓</h1>
      <p>Plateforme éducative - Vérification sécurisée AES</p>
      <div style={{border:'1px solid #ddd',padding:16,borderRadius:8,marginBottom:20}}>
        <h3>1. Générer un code</h3>
        <input placeholder="Matricule" value={matricule} onChange={e=>setMat(e.target.value)} style={{padding:8,width:'48%',marginRight:'4%'}}/>
        <input placeholder="Note / 20" value={note} onChange={e=>setNote(e.target.value)} style={{padding:8,width:'48%'}}/>
        <button onClick={generer} style={{marginTop:10,padding:'10px 20px',background:'#16a34a',color:'#fff',border:0,borderRadius:6}}>Générer code AES</button>
        {code && <div style={{marginTop:10,wordBreak:'break-all',background:'#f0fdf4',padding:10}}><b>Code:</b> {code}</div>}
      </div>
      <div style={{border:'1px solid #ddd',padding:16,borderRadius:8}}>
        <h3>2. Vérifier un code</h3>
        <input placeholder="Collez le code ici" value={verifCode} onChange={e=>setVerifCode(e.target.value)} style={{padding:8,width:'100%'}}/>
        <button onClick={verifier} style={{marginTop:10,padding:'10px 20px',background:'#2563eb',color:'#fff',border:0,borderRadius:6}}>Vérifier</button>
        {result && <pre style={{marginTop:10,background:'#eff6ff',padding:10}}>{JSON.stringify(result,null,2)}</pre>}
      </div>
      <p style={{marginTop:30,color:'#666'}}>Déployé sur Render • GitHub: Honore1980/VERIF-NOTES-PRO-COMPLET</p>
    </div>
  )
}
