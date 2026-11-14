/* Synchronisation familiale V1 : un compte Supabase Auth par groupe d'appareils.
   Aucun secret serveur/service_role ne doit figurer dans ce fichier. */
(()=>{
'use strict';
const C='gf-supabase-config',T='gf-auth-session',S='gf-sync-enabled',P='gf-sync-pending';
const DEFAULT_CONFIG={url:'https://nvctiwhfydidlfjumfgd.supabase.co',key:'sb_publishable_CGqqjoi0tDPmLhQexxPNVw_S4lPC4Wk'};
let config=JSON.parse(localStorage.getItem(C)||'null')||DEFAULT_CONFIG,session=JSON.parse(localStorage.getItem(T)||'null');
let enabled=localStorage.getItem(S)==='1',pending=localStorage.getItem(P)==='1',busy=false,lastTimestamp='',timer=null;
const by=id=>document.getElementById(id);
const status=msg=>{const el=by('sync-status');if(el)el.textContent=msg};
const configured=()=>config&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.url)&&/^(sb_publishable_|eyJ)/.test(config.key);
const api=async(path,method='GET',body,auth=true,headers={})=>{
 if(!configured())throw Error('Configure le projet Supabase.');
 const h={'apikey':config.key,...headers};if(auth){await refresh();if(!session?.access_token)throw Error('Connecte-toi d’abord.');h.Authorization='Bearer '+session.access_token}
 if(body!==undefined)h['Content-Type']='application/json';
 const response=await fetch(config.url.replace(/\/$/,'')+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});
 const raw=await response.text();let json;try{json=raw?JSON.parse(raw):null}catch{json=raw}
 if(!response.ok)throw Error(json?.msg||json?.message||json?.error_description||json?.error||'Erreur serveur '+response.status);
 return json;
};
async function refresh(){if(!session?.refresh_token)return; if(session.expires_at>Date.now()+60000)return;
 const result=await fetch(config.url.replace(/\/$/,'')+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});
 const newSession=await result.json();if(!result.ok){session=null;enabled=false;localStorage.removeItem(T);localStorage.removeItem(S);throw Error('Session expirée : reconnecte-toi.')}
 saveSession(newSession);
}
function saveSession(s){session={access_token:s.access_token,refresh_token:s.refresh_token,expires_at:Date.now()+s.expires_in*1000};localStorage.setItem(T,JSON.stringify(session))}
async function userId(){const u=await api('/auth/v1/user');if(!u?.id)throw Error('Compte non reconnu');return u.id}
async function cloud(){const uid=await userId();const r=await api('/rest/v1/family_snapshots?user_id=eq.'+encodeURIComponent(uid)+'&select=payload,updated_at');return {uid,record:r?.[0]||null}}
const validate=d=>d&&['buses','transactions','controles','gardes','taches','maisons'].every(k=>Array.isArray(d[k]))&&(!d.dettes||Array.isArray(d.dettes));
function loadCloud(r){if(!validate(r.payload))throw Error('La sauvegarde distante est invalide');data=r.payload;if(!Array.isArray(data.dettes))data.dettes=[];localStorage.setItem(KEY,JSON.stringify(data));lastTimestamp=r.updated_at;pending=false;localStorage.removeItem(P);render()}
async function push(){if(!enabled||busy||!navigator.onLine)return;busy=true;try{const uid=await userId();const r=await api('/rest/v1/family_snapshots?on_conflict=user_id','POST',{user_id:uid,payload:data},true,{'Prefer':'resolution=merge-duplicates,return=representation'});lastTimestamp=r?.[0]?.updated_at||new Date().toISOString();pending=false;localStorage.removeItem(P);status('Synchronisé avec le cloud : '+new Date().toLocaleTimeString('fr-FR'))}catch(e){status('En attente de synchronisation : '+e.message)}finally{busy=false}}
function changed(){if(!enabled)return;pending=true;localStorage.setItem(P,'1');status('Modifications locales à synchroniser…');clearTimeout(timer);timer=setTimeout(push,900)}
async function poll(){if(!enabled||busy||!navigator.onLine)return;if(pending){await push();return}
 busy=true;try{const {record}=await cloud();if(record&&record.updated_at!==lastTimestamp){loadCloud(record);status('Mise à jour reçue : '+new Date().toLocaleTimeString('fr-FR'))}}catch(e){status('Connexion : '+e.message)}finally{busy=false}}
window.addEventListener('family-local-change',changed);window.addEventListener('online',()=>{if(enabled){pending?push():poll()}});
setInterval(poll,12000);
window.familySyncPage=function(){
 const good=configured(),logged=!!session?.access_token;
 return panel('Synchronisation entre téléphones','<p>Les données restent enregistrées sur chaque téléphone, et une copie sécurisée permet de les retrouver sur un autre appareil via le même lien. <strong>Le lien seul ne donne pas accès aux données</strong> : une connexion est obligatoire.</p><div class="warn">Projet familial préconfiguré. Une table sécurisée reste à installer avant la première connexion. Deux appareils connectés avec le même compte peuvent partager les données ; évite les modifications simultanées car cette version ne fusionne pas les changements concurrents.</div>'+
 '<form id="sync-config-form"><div class="fields">'+field('URL du projet Supabase','url',config?.url||'')+field('Clé publishable (publique, jamais service_role)','key',config?.key||'')+'</div><button type="submit">Enregistrer la configuration</button></form>'+
 '<div class="panel"><h2>1. Activer la table sécurisée</h2><p>Cette étape se fait une seule fois dans ton projet familial Supabase. Ta table gestion_famille reste intacte ; le module utilise une table dédiée family_snapshots.</p><p><a href="https://supabase.com/dashboard/project/nvctiwhfydidlfjumfgd/sql/new" target="_blank" rel="noopener noreferrer">Ouvrir l’éditeur SQL du projet familial</a></p><button type="button" id="sync-copy-sql">Copier le SQL de configuration</button> <a href="supabase/schema.sql" target="_blank" rel="noopener noreferrer">Afficher le SQL</a><p class="muted">Colle le SQL dans l’éditeur du projet familial et clique sur Run. N’exécute pas ce SQL sur ta base PMR.</p></div>'+ 
 '<p class="muted">Configuration : '+(good?'projet renseigné':'à renseigner')+'. Tu peux créer un compte après avoir installé la table et les règles RLS.</p>'+
 (good?'<form id="sync-login"><div class="fields">'+field('Adresse e-mail','email','','email')+'<div class="field"><label>Mot de passe</label><input name="password" type="password" autocomplete="current-password" required></div></div><button class="primary" type="submit">Se connecter</button><button id="sync-signup" type="button">Créer un compte</button></form>':'')+
 (logged?'<div class="panel"><h2>Transfert des données</h2><p>Au premier usage, choisis <b>une seule</b> option après avoir vérifié quelle copie est la plus récente :</p><button id="sync-upload" type="button" class="primary">Envoyer les données de cet appareil</button> <button id="sync-download" type="button">Récupérer les données du cloud</button> <button id="sync-signout" type="button" class="danger">Se déconnecter</button><p>Synchronisation automatique : <b>'+(enabled?'activée':'désactivée')+'</b></p><p id="sync-status" role="status"></p></div>':'<p id="sync-status" role="status">Connecte-toi pour activer le partage.</p>')+
 '<p class="muted">Pour l’instant, les données restent locales tant que la connexion cloud n’est pas configurée. Exporte une sauvegarde JSON avant une première synchronisation.</p>');
};
window.familySyncBind=function(){
 const cf=by('sync-config-form');if(!cf)return;
 const sqlButton=by('sync-copy-sql');if(sqlButton)sqlButton.onclick=async()=>{try{const r=await fetch('supabase/schema.sql',{cache:'no-store'});if(!r.ok)throw Error('Fichier SQL introuvable');await navigator.clipboard.writeText(await r.text());sqlButton.textContent='SQL copié !'}catch(e){alert('Copie impossible : utilise le lien Afficher le SQL puis copie son contenu. '+e.message)}};
 cf.onsubmit=e=>{e.preventDefault();const f=new FormData(cf),url=String(f.get('url')||'').trim().replace(/\/$/,''),key=String(f.get('key')||'').trim();if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)||!/^(sb_publishable_|eyJ)/.test(key)){alert('Indique une URL Supabase valide et la clé publishable.');return}config={url,key};localStorage.setItem(C,JSON.stringify(config));session=null;enabled=false;localStorage.removeItem(T);localStorage.removeItem(S);render()};
 const login=by('sync-login');if(login){login.onsubmit=async e=>{e.preventDefault();try{const f=new FormData(login),s=await api('/auth/v1/token?grant_type=password','POST',{email:f.get('email'),password:f.get('password')},false);saveSession(s);enabled=false;localStorage.removeItem(S);render()}catch(err){status(err.message)}};by('sync-signup').onclick=async()=>{const f=new FormData(login);try{await api('/auth/v1/signup','POST',{email:f.get('email'),password:f.get('password')},false);status('Compte créé : vérifie ton e-mail si la confirmation est activée, puis connecte-toi.')}catch(err){status(err.message)}}}
 if(by('sync-signout'))by('sync-signout').onclick=()=>{enabled=false;session=null;localStorage.removeItem(S);localStorage.removeItem(T);render()};
 if(by('sync-upload'))by('sync-upload').onclick=async()=>{if(!confirm('Envoyer cette copie sur le cloud ? Une copie existante du même compte sera remplacée.'))return;enabled=true;localStorage.setItem(S,'1');pending=true;localStorage.setItem(P,'1');render();await push()};
 if(by('sync-download'))by('sync-download').onclick=async()=>{try{const {record}=await cloud();if(!record){status('Aucune sauvegarde distante pour ce compte.');return}if(!confirm('Remplacer les données locales de cet appareil par celles du cloud ? Exporte une sauvegarde avant.'))return;loadCloud(record);enabled=true;localStorage.setItem(S,'1');render()}catch(e){status(e.message)}};
};
})();
