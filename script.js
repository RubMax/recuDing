function getValue(lines, label){

    let index = lines.findIndex(
        item => item.trim() === label
    );

    if(index >= 0 && lines[index+1]){
        return lines[index+1];
    }

    return "";
}

function generateReceipt(){

    const raw = document
    .getElementById("rawText")
    .value;

    const extra = parseFloat(
        document.getElementById("extraValue").value
    ) || 0;

    const lines = raw
    .split("\n")
    .map(x=>x.trim())
    .filter(x=>x);

    const reference = getValue(lines,"Référence");
    const etat = getValue(lines,"État");
    const date = getValue(lines,"Date");
    const pays = getValue(lines,"Pays");
    const operateur = getValue(lines,"Opérateur");
    const produit = getValue(lines,"Type de produit");
    const montantEnvoye = getValue(lines,"Montant envoyé");
    const montantRecu = getValue(lines,"Montant reçu");
    const numero = getValue(lines,"Numéro de destination");

    let brl = montantEnvoye
        .replace("BRL","")
        .replace(",",".")
        .trim();

    brl = parseFloat(brl);

    const total = brl + extra;

    const montantFinal =
        total.toFixed(2)
        .replace(".",",")
        +" BRL";

    document.getElementById("receiptContainer").innerHTML = `
    
    <div id="receipt">

        <div class="success-circle">
            ✓
        </div>

        <div class="receipt-title">
            CONFIRMATION DE COMMANDE
        </div>

        <div class="separator"></div>

        <div class="row">
            <div class="label">Référence</div>
            <div class="value">${reference}</div>
        </div>

        <div class="row">
            <div class="label">État</div>
            <div class="value">${etat}</div>
        </div>

        <div class="row">
            <div class="label">Date</div>
            <div class="value">${date}</div>
        </div>

        <div class="row">
            <div class="label">Pays</div>
            <div class="value">${pays}</div>
        </div>

        <div class="row">
            <div class="label">Opérateur</div>
            <div class="value">${operateur}</div>
        </div>

        <div class="row">
            <div class="label">Type de produit</div>
            <div class="value">${produit}</div>
        </div>

        <div class="row">
            <div class="label">Montant envoyé</div>
            <div class="value">${montantFinal}</div>
        </div>

        <div class="row">
            <div class="label">Montant reçu</div>
            <div class="value">${montantRecu}</div>
        </div>

        <div class="row">
            <div class="label">Numéro destination</div>
            <div class="value">${numero}</div>
        </div>

        <div class="separator"></div>

        <div class="footer-links">
    <span>Impression d'un reçu</span>
    <span>Envoi du reçu par SMS</span>
</div>


<div class="services-box">
    <div class="services-title">
        Pa bliye nou gen Sèvis:
    </div>
    
    <div class="services-two-columns">
        <div class="services-column">
            <div>✓ MoneyGram</div>
            <div>✓ Unitransfer (Ria)</div>
            <div>✓ CamTransfer</div>
            <div>✓ Western Union</div>
            <div>✓ MonCash, NatCash, LajanCash</div>
            <div>✓ Depo US$ Haiti</div>
        </div>
        <div class="services-column">
            
            <div>✓ </div>
        </div>
    </div>
</div>
    </div>
    
    `;
}

async function downloadReceipt(){

    const receipt = document.getElementById("receipt");

    if(!receipt){
        alert("Générez un reçu d'abord.");
        return;
    }
    async function createCanvas(){

    const receipt = document.getElementById("receipt");

    receipt.classList.add("receipt-export");

    const canvas = await html2canvas(receipt,{
        scale:4,
        useCORS:true
    });

    receipt.classList.remove("receipt-export");

    return canvas;
}


    const canvas = await html2canvas(receipt,{
        scale:4,
        useCORS:true
    });

    const link = document.createElement("a");

    link.download = "recu.png";

    link.href = canvas.toDataURL("image/png");

    link.click();
}

async function shareReceipt(){

    const receipt = document.getElementById("receipt");

    if(!receipt){
        alert("Générez un reçu d'abord.");
        return;
    }

    const canvas = await html2canvas(receipt,{
        scale:4,
        useCORS:true
    });

    canvas.toBlob(async(blob)=>{

        const file = new File(
            [blob],
            "recu.png",
            {type:"image/png"}
        );

        if(navigator.canShare &&
           navigator.canShare({files:[file]})){

            await navigator.share({
                files:[file],
                title:"Reçu"
            });

        }else{

            alert(
                "Le partage direct n'est pas supporté sur cet appareil."
            );

        }

    });
}

// Enregistrement du Service Worker pour PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
      })
      .catch(error => {
        console.log('Erreur lors de l\'enregistrement du Service Worker:', error);
      });
  });
}

// Détection d'installation de la PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Empêcher l'affichage automatique
  e.preventDefault();
  deferredPrompt = e;
  
  // Afficher un bouton d'installation personnalisé
  showInstallPromotion();
});

function showInstallPromotion() {
  // Créer un bouton d'installation
  const installBtn = document.createElement('button');
  installBtn.textContent = '📱 Installer l\'application';
  installBtn.style.position = 'fixed';
  installBtn.style.bottom = '20px';
  installBtn.style.right = '20px';
  installBtn.style.zIndex = '1000';
  installBtn.style.backgroundColor = '#00a651';
  installBtn.style.color = 'white';
  installBtn.style.border = 'none';
  installBtn.style.borderRadius = '50px';
  installBtn.style.padding = '12px 20px';
  installBtn.style.cursor = 'pointer';
  installBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  
  installBtn.onclick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Résultat de l'installation: ${outcome}`);
      deferredPrompt = null;
      installBtn.remove();
    }
  };
  
  document.body.appendChild(installBtn);
  
  // Auto-supprimer après 10 secondes
  setTimeout(() => {
    if (installBtn.parentNode) {
      installBtn.remove();
    }
  }, 10000);
}