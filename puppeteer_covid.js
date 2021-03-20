const puppeteer = require('puppeteer');
const fs        = require('fs');
const { exec } = require('child_process');

// const root_url  = 'https://media.interieur.gouv.fr/deplacement-covid-19/';
const root_url  = 'https://media.interieur.gouv.fr/attestation-deplacement-derogatoire-covid-19/';
// node puppeteer_covid.js --path=./ --nom="do" --prenom="jo" --date="11/06/2020" --lieu="Champigny" --addresse="13 rue
// de la Pompe" --ville="Paris" --postal="75016" --datesortie="01/11/2020" --heuresortie="15:30" --postal=75016
// --motif="achats"

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
  if(/^-*type=/.test(val)){ type = val.split('=')[1].replace(/^"/,'').replace(/"$/,''); }
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
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], userDataDir:'/home/pi/dev/flask_covid/chrome_data', timeout:90000});

    const page = await browser.newPage();
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));
   
    await page.setViewport({width:1600, height:900});
    await page.setDefaultNavigationTimeout(90000);

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

    try {
      let invoice, node, lst_nodes, i;

      await page.goto(root_url);
      await page.waitForSelector('button.curfew-button');
      await page.waitForSelector('button.quarantine-button');

      if(type==='curfew'){
        await page.click('button.curfew-button');
        await page.waitFor(800);
      }
      if(type==='quarantine'){
        await page.click('button.quarantine-button');
        await page.waitFor(800);
      }

      await page.waitForSelector('input[name="firstname"]');
      await page.evaluate((prenom)=>{document.querySelector('input[name="firstname"]').value=prenom}, prenom);
      await page.waitForSelector('input[name="firstname"] ~ span.validity')

      await page.evaluate((nom)=>{document.querySelector('input[name="lastname"]').value=nom}, nom);
      await page.waitForSelector('input[name="lastname"] ~ span.validity')

      await page.waitForSelector('input[name="birthday"]');
      await page.type('input[name="birthday"]', date);
      await page.waitForSelector('input[name="birthday"] ~ span.validity')

      await page.waitForSelector('input[name="placeofbirth"]');
      await page.evaluate((lieu)=>{document.querySelector('input[name="placeofbirth"]').value=lieu}, lieu);
      await page.waitForSelector('input[name="placeofbirth"] ~ span.validity')

      await page.waitForSelector('input[name="address"]');
      await page.evaluate((addresse)=>{document.querySelector('input[name="address"]').value=addresse}, addresse);
      await page.waitForSelector('input[name="address"] ~ span.validity')

      await page.waitForSelector('input[name="city"]');
      await page.evaluate((ville)=>{document.querySelector('input[name="city"]').value=ville}, ville);
      await page.waitForSelector('input[name="city"] ~ span.validity')

      await page.waitForSelector('input[name="zipcode"]');
      await page.type('input[name="zipcode"]', postal);
      await page.waitFor(100);
      await page.waitForSelector('input[name="zipcode"] ~ span.validity')

      // await page.waitForSelector('input[name="datesortie"]');
      // await page.evaluate((date_sortie)=>{
      //                            document.querySelector('input[name="datesortie"]').value=date_sortie;
      //                      }, date_sortie);
      // // await page.type('input[name="datesortie"]', date_sortie);
      // await page.waitForSelector('input[name="datesortie"] ~ span.validity')
      // await page.waitFor(200);

      await page.waitForSelector('input[name="heuresortie"]');
      await page.evaluate((heure_sortie)=>{
                                 document.querySelector('input[name="heuresortie"]').value=heure_sortie;
                           }, heure_sortie);
      await page.waitFor(50);
      await page.waitForSelector('input[name="heuresortie"] ~ span.validity')
      await page.waitFor(50);

      await page.evaluate((motif)=>{document.querySelector('input[type="checkbox"][value="'+motif+'"]').scrollIntoView()}, motif);
      await page.waitFor(50);

      await page.click('input[type="checkbox"][value="'+motif+'"]');
      await page.waitForSelector('#generate-btn');
      await page.waitFor(50);


      await page.evaluate(()=>{document.querySelector('#generate-btn').scrollIntoView()});
      await page.waitFor(50);

      await page.click('#generate-btn');
      await page.waitFor(800);
      await page.click('#generate-btn');
      await page.waitForSelector('a[download]');

      let content = await page.evaluate(() => {
        let base64ArrayBuffer = (arrayBuffer) => {
          var base64    = ''
          var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
          var bytes         = new Uint8Array(arrayBuffer)
          var byteLength    = bytes.byteLength
          var byteRemainder = byteLength % 3
          var mainLength    = byteLength - byteRemainder
          var a, b, c, d
          var chunk
          for (var i = 0; i < mainLength; i = i + 3) {
              chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
              a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
              b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
              c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
              d = chunk & 63               // 63       = 2^6 - 1
              base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
            }
          if (byteRemainder == 1) {
              chunk = bytes[mainLength]
              a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
              b = (chunk & 3)   << 4 // 3   = 2^2 - 1
              base64 += encodings[a] + encodings[b] + '=='
            } else if (byteRemainder == 2) {
                chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
                a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
                b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
                c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
                base64 += encodings[a] + encodings[b] + encodings[c] + '='
              }
          return base64
        };
        let _url = Array.from(document.querySelectorAll('a[download]')).splice(-1)[0].href;
        return fetch(_url).then(r => r.blob()).then(blob => blob.arrayBuffer()).then(buffer => base64ArrayBuffer(buffer));
      });

      await console.log(content);
    } catch (error) {
      console.log(error);
    }
    await browser.close();
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

  (async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], userDataDir:'/home/pi/dev/flask_covid/chrome_data', timeout:90000});

  const page = await browser.newPage();
  // page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.setViewport({width:1600, height:900});
  await page.setDefaultNavigationTimeout(90000);

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

  try {
    let invoice, node, lst_nodes, i;

    await page.goto(root_url);
    await page.waitForSelector('input[type="checkbox"]');
    await page.waitForSelector('button.curfew-button');
    await page.waitForSelector('button.quarantine-button');

    await page.click('button.curfew-button');
    await page.waitFor(2000);
    const curfew_labels_reasons = await page.evaluate(()=>{
      return Object.fromEntries(Array.from(Array.from(document.querySelectorAll('div.fieldset-wrapper label[for]')).filter(e=>!!( e.offsetWidth || e.offsetHeight || e.getClientRects().length ))).map((e)=> [e.previousSibling.value, e.innerText.trim().replace(/;*/,'')]));
    });

    await page.click('button.quarantine-button');
    await page.waitFor(2000);
    const quarantine_labels_reasons = await page.evaluate(()=>{
      return Object.fromEntries(Array.from(Array.from(document.querySelectorAll('div.fieldset-wrapper label[for]')).filter(e=>!!( e.offsetWidth || e.offsetHeight || e.getClientRects().length ))).map((e)=> [e.previousSibling.value, e.innerText.trim().replace(/;*/,'')]));
    });

    await fs.writeFile("reasons.json",
      JSON.stringify({'curfew'     : curfew_labels_reasons,
                      'quarantine' : quarantine_labels_reasons}), function(err) {
          if(err) {
              console.log(err);
              return;
          }
    });
  } catch (error) {
    console.log(error);
  }
    await browser.close();
  })();
}
