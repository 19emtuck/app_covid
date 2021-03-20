const fs        = require('fs');
const pdf       = require('./js/pdf-util.js');

let nom          = null;
let prenom       = null;
let date         = null;
let lieu         = null;
let addresse     = null;
let ville        = null;
let postal       = null;
let date_sortie  = null;
let heure_sortie = null;
let motif        = null;
let debug        = false;

let args = process.argv;


args = args.splice(2).join(' ').replace('^--','').split(' --');

args.forEach(function (val, index, array) {
  if(/^-*nom=/.test(val)){ nom = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/^-*prenom=/.test(val)){ prenom = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/^-*date=/.test(val)){ date = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/^-*lieu=/.test(val)){ lieu = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/^-*addresse=/.test(val)){ addresse = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/^-*ville=/.test(val)){ ville = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/^-*postal=/.test(val)){ postal = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/^-*datesortie=/.test(val)){ date_sortie = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/^-*heuresortie=/.test(val)){ heure_sortie = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/^-*motif=/.test(val)){ motif = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
  if(/debug/.test(val)){ debug = true; }
});

if(    nom !== null
    && prenom !== null
    && date !== null
    && lieu !== null
    && addresse !== null
    && postal !== null
    && date_sortie !== null
    && heure_sortie !== null
    && motif !== null
){
  (async () => {
    try {
      let profile = { lastname     : nom,
                      firstname    : prenom,
                      birthday     : date,
                      placeofbirth : lieu,
                      address      : addresse,
                      zipcode      : postal,
                      city         : ville,
                      datesortie   : date_sortie,
                      heuresortie  : heure_sortie };
      
      const existingPdfBytes = fs.readFileSync('./js/certificate.pdf', {flag:'r'}).buffer;
      let pdfBase64 = await pdf.generatePdf(profile, motif, existingPdfBytes);
      await console.log(pdfBase64);
    } catch (error) {
      console.log(error);
    }
  })();
} else {
  if( nom == null){
    console.log('nom cible manquant');
  }
  if( prenom == null){
    console.log('prenom cible manquant');
  }
  if( date == null){
    console.log('date cible manquant');
  }
  if( lieu == null){
    console.log('lieu cible manquant');
  }
  if( addresse == null){
    console.log('addresse cible manquant');
  }
  if( postal == null){
    console.log('postal cible manquant');
  }
  if( date_sortie == null){
    console.log('date sortie cible manquant');
  }
  if( heure_sortie == null){
    console.log('heure sortie cible manquant');
  }
  if( motif == null){
    console.log('heure sortie cible manquant');
  }
}
