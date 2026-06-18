function getValue(lines, label){

    let index = lines.findIndex(
        item => item.trim() === label
    );

    if(index >= 0 && lines[index+1]){
        return lines[index+1];
    }

    return "";
}

function generateReceipt() {
    // Efface les messages d'erreur précédents
    clearErrorMessage();
    
    // Vérifie la valeur extra avant de continuer
    if (!validateExtraValueBeforeGenerate()) {
        return;  // Stop la génération si l'utilisateur annule
    }
    
    const raw = document.getElementById("rawText").value;
    const extra = parseFloat(document.getElementById("extraValue").value) || 0;
    const lines = raw.split("\n").map(x => x.trim()).filter(x => x);

    const reference = getValue(lines, "Référence");
    const etat = getValue(lines, "État");
    const date = getValue(lines, "Date");
    const pays = getValue(lines, "Pays");
    const operateur = getValue(lines, "Opérateur");
    const produit = getValue(lines, "Type de produit");
    const montantEnvoye = getValue(lines, "Montant envoyé");
    const montantRecu = getValue(lines, "Montant reçu");
    const numero = getValue(lines, "Numéro de destination");

    // Validation des données
    if (!validateReceiptData(reference, numero)) {
        document.getElementById("receiptContainer").innerHTML = "";
        return;
    }
    hideInputOnMobile();

    let brl = montantEnvoye.replace("BRL", "").replace(",", ".").trim();
    brl = parseFloat(brl);
    const total = brl + extra;
    const montantFinal = total.toFixed(2).replace(".", ",") + " BRL";

    // =====================================
// CONFIRMATION DU MONTANT DE RECHARGE
// =====================================

const confirmationRecharge = confirm(
`
TOTAL RECHARGER: ${total.toFixed(2)} BRL ?
`
);

if (!confirmationRecharge) {
    return;
}

    // Le reste de votre code de génération...
    document.getElementById("receiptContainer").innerHTML = `
        <div id="receipt">
            <div class="services-title">RubMax Recargar internacional</div>
            <div class="receipt-title">CONFIRMATION DE COMMANDE</div>
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


<!-- Dans votre HTML, structure simplifiée -->
<div class="services-box">
    <div class="services-title">SERVIÇOS:</div>
    
    <div style="display: flex; flex-direction: row; gap: 10px; width: 100%;">
        <div style="flex: 1; width: 50%;">
            <div>✓ MoneyGram</div>
            <div>✓ Unitransfer (Ria)</div>
            <div>✓ CamTransfer</div>
            <div>✓ Western Union</div>
            <div>✓ MonCash, NatCash, LajanCash</div>
            <div>✓ Depo US$ Haiti</div>
        </div>
        <div style="flex: 1; width: 50%;">
            <div>✓ Xerox</div>
            <div>✓ Imprimir</div>
            <div>✓ Plastificar</div>
            <div>✓ Photo 3/4, 4/6, A4</div>
            <div>✓ Declaração de endereço</div> 
            <div>✓ Antecedentes criminais</div>
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

// Fonction pour vérifier les données requises
function validateReceiptData(reference, numero) {
    // Vérifie si la référence est manquante ou vide
    if (!reference || reference.trim() === "") {
        showErrorMessage("Les données ne sont pas complètement copiées depuis Ding");
        return false;
    }
    
    // Vérifie si le numéro est manquant ou vide
    if (!numero || numero.trim() === "") {
        showErrorMessage("Les données ne sont pas complètement copiées depuis Ding");
        return false;
    }
    
    return true;
}

// Fonction pour afficher le message d'erreur
function showErrorMessage(message) {
    // Crée ou récupère le conteneur d'erreur
    let errorDiv = document.getElementById("errorMessage");
    
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "errorMessage";
        errorDiv.style.cssText = `
            background-color: #f44336;
            color: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            animation: slideIn 0.5s ease;
        `;
        
        // Ajoute l'animation CSS
        if (!document.querySelector("#errorAnimation")) {
            const style = document.createElement("style");
            style.id = "errorAnimation";
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Insère avant le bouton de génération
        const generateBtn = document.querySelector(".generate-btn");
        generateBtn.parentNode.insertBefore(errorDiv, generateBtn.nextSibling);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    
    // Cache le message après 5 secondes
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.style.opacity = "0";
            setTimeout(() => {
                if (errorDiv) {
                    errorDiv.style.display = "none";
                    errorDiv.style.opacity = "1";
                }
            }, 500);
        }
    }, 5000);
}

// Fonction pour effacer le message d'erreur
function clearErrorMessage() {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
        errorDiv.style.display = "none";
    }
}
// Fonction pour vérifier et demander la valeur ajoutée
// Fonction pour vérifier et demander la valeur ajoutée
function checkAndRequestExtraValue() {
    const extraValueInput = document.getElementById("extraValue");
    const rawText = document.getElementById("rawText").value;
    
    // Vérifie si le texte a été collé
    if (!rawText || rawText.trim() === "") {
        return;
    }
    
    // Vérifie si l'utilisateur a déjà interagi avec le champ
    const alreadyInteracted = extraValueInput.hasAttribute("data-interacted");
    
    // Si déjà interacté, ne pas demander à nouveau
    if (alreadyInteracted) {
        return;
    }
    
    // Récupère la valeur actuelle
    let currentValue = parseFloat(extraValueInput.value) || 0;
    
    // Si la valeur est 0, demande à l'utilisateur une seule fois
    if (currentValue === 0) {
        // Fait clignoter le champ en rouge
        blinkRedInput(extraValueInput);
        
        // Affiche une boîte de dialogue personnalisée
        const userValue = prompt(
            "⚠️ AJOUTER LA VALEUR ENLEVÉE ⚠️\n\n" +
            "Entrez 0 si aucun montant à ajouter"
        );
        
        if (userValue !== null) {
            let parsedValue = parseFloat(userValue.replace(",", "."));
            if (!isNaN(parsedValue)) {
                extraValueInput.value = parsedValue;
                // Marque comme interacté
                extraValueInput.setAttribute("data-interacted", "true");

                // Enlève le rouge si une valeur est entrée
                if (parsedValue !== 0) {
                    removeRedHighlight(extraValueInput);
                }
                showRechargeConfirmation();
            } else {
                // Si valeur invalide, met 0 et marque comme interacté
                extraValueInput.value = 0;
                extraValueInput.setAttribute("data-interacted", "true");
                alert("Valeur invalide. 0 sera utilisé.");
            }
        } else {
            // Si l'utilisateur annule, marque comme interacté avec 0
            extraValueInput.setAttribute("data-interacted", "true");
        }
    }
}



// Fonction pour faire clignoter l'input en rouge
function blinkRedInput(inputElement) {
    // Enlève les classes existantes
    inputElement.classList.remove("red-highlight", "blink-animation");
    
    // Force le reflow
    void inputElement.offsetWidth;
    
    // Ajoute la classe d'animation
    inputElement.classList.add("red-highlight", "blink-animation");
    
    // Compte les clignotements (5 fois)
    let blinks = 0;
    const blinkInterval = setInterval(() => {
        if (blinks >= 5) {
            clearInterval(blinkInterval);
            // Enlève l'animation mais garde le rouge si toujours 0
            inputElement.classList.remove("blink-animation");
            if (parseFloat(inputElement.value) === 0) {
                inputElement.classList.add("red-highlight");
            }
        }
        blinks++;
    }, 500);
}

// Fonction pour enlever le surlignage rouge
function removeRedHighlight(inputElement) {
    inputElement.classList.remove("red-highlight", "blink-animation");
    inputElement.style.transition = "all 0.3s ease";
}

// Fonction pour vérifier avant génération
function validateExtraValueBeforeGenerate() {
    const extraValueInput = document.getElementById("extraValue");
    const currentValue = parseFloat(extraValueInput.value) || 0;
    
    if (currentValue === 0) {
        // Demande simplement confirmation sans bloquer
        const confirmGenerate = confirm(
            "Le montant ajouté est 0 BRL.\n\n" +
            "Voulez-vous générer le reçu ?"
        );
        
        if (confirmGenerate) {
            removeRedHighlight(extraValueInput);
            return true;  // Accepte la génération avec 0
        } else {
            extraValueInput.focus();
            return false;  // Annule la génération
        }
    }
    
    return true;  // Valeur non-zero, accepter
}
// ============================================
// ÉCOUTEURS D'ÉVÉNEMENTS POUR LE COLLAGE
// ============================================

// Attendre que la page soit complètement chargée
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Écouteur pour le champ textarea (coller du texte)
    const rawTextArea = document.getElementById("rawText");
    if (rawTextArea) {
        rawTextArea.addEventListener("paste", function(e) {
            // Petite pause pour que le texte soit bien collé
            setTimeout(() => {
                checkAndRequestExtraValue();
            }, 100);
        });
        
        // 2. Écouteur pour quand l'utilisateur tape ou colle avec la souris
        rawTextArea.addEventListener("input", function() {
            // Vérifie si le texte est suffisamment long (signe d'un collage)
            if (this.value.length > 30) {
                checkAndRequestExtraValue();
            }
        });
        
        // 3. Écouteur pour quand l'utilisateur quitte le champ
        rawTextArea.addEventListener("blur", function() {
            if (this.value.length > 0) {
                checkAndRequestExtraValue();
            }
        });
    }
    
    // 4. Écouteur pour le champ extraValue (quand l'utilisateur change la valeur)
    const extraValueInput = document.getElementById("extraValue");
    if (extraValueInput) {
        extraValueInput.addEventListener("change", function() {
            if (parseFloat(this.value) !== 0) {
                removeRedHighlight(this);
            } else {
                blinkRedInput(this);
            }
        });
        
        // 5. Quand l'utilisateur tape dans le champ extraValue
        extraValueInput.addEventListener("input", function() {
            if (parseFloat(this.value) !== 0) {
                removeRedHighlight(this);
            }
        });
    }
    
    // 6. Écouteur global pour le raccourci clavier Ctrl+V (coller)
    document.addEventListener("keydown", function(e) {
        // Vérifie si Ctrl+V (ou Cmd+V sur Mac) est pressé
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            // Vérifie si le focus est sur le textarea
            if (document.activeElement === rawTextArea) {
                setTimeout(() => {
                    checkAndRequestExtraValue();
                }, 50);
            }
        }
    });
    
    // 7. Option: Détecter le collage via le menu contextuel (clic droit > coller)
    rawTextArea.addEventListener("mouseup", function() {
        // Vérifie si le texte a changé récemment
        setTimeout(() => {
            if (this.value.length > 30) {
                checkAndRequestExtraValue();
            }
        }, 50);
    });
});

// ============================================
// FONCTION POUR FORCER LA VÉRIFICATION MANUELLEMENT
// ============================================

// Ajoute un bouton optionnel pour vérifier manuellement
function addManualCheckButton() {
    const extraValueInput = document.getElementById("extraValue");
    const parentDiv = extraValueInput.parentNode;
    
    // Crée un petit bouton d'aide
    const helpButton = document.createElement("small");
    helpButton.textContent = " ⚠️ Ajouter valeur";
    helpButton.style.cursor = "pointer";
    helpButton.style.color = "#ff0000";
    helpButton.style.fontSize = "12px";
    helpButton.style.marginLeft = "10px";
    helpButton.title = "Cliquez pour ajouter la valeur enlevée";
    
    helpButton.onclick = function() {
        checkAndRequestExtraValue();
    };
    
    parentDiv.appendChild(helpButton);
}

// Appeler cette fonction après le chargement
setTimeout(addManualCheckButton, 1000);


function hideInputOnMobile(){

    if(window.innerWidth <= 768){

        document.getElementById("inputSection").style.display = "none";

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    }

}
function showInputSection(){

    // Réafficher le formulaire
    document.getElementById("inputSection").style.display = "block";

    // Vider les champs
    document.getElementById("rawText").value = "";
    document.getElementById("extraValue").value = 0;

    // Réinitialiser les indicateurs
    document.getElementById("extraValue")
        .removeAttribute("data-interacted");

    // Enlever les styles d'alerte
    removeRedHighlight(
        document.getElementById("extraValue")
    );

    // Supprimer le reçu affiché
    document.getElementById("receiptContainer").innerHTML = "";

    // Effacer les messages d'erreur
    clearErrorMessage();

    // Retour en haut de la page
    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

    // Donner le focus à la zone de collage
    document.getElementById("rawText").focus();
}
function showRechargeConfirmation() {

    const raw = document.getElementById("rawText").value;

    if (!raw.trim()) return;

    const extra = parseFloat(
        document.getElementById("extraValue").value
    ) || 0;

    const lines = raw
        .split("\n")
        .map(x => x.trim())
        .filter(x => x);

    const montantEnvoye = getValue(
        lines,
        "Montant envoyé"
    );

    let brl = montantEnvoye
        .replace("BRL", "")
        .replace(",", ".")
        .trim();

    brl = parseFloat(brl);

    const total = brl + extra;

    const ok = confirm(
`CONFIRMATION DE RECHARGE

Montant Ding :${brl.toFixed(2)} BRL
Montant ajouté :${extra.toFixed(2)} BRL
TOTAL :${total.toFixed(2)} BRL

Le client demande-t-il une recharge de ${total.toFixed(2)} BRL ?`
    );

    if (ok) {
        generateReceipt();
    }
}