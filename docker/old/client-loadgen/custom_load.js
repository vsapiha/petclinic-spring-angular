const { Chromeless } = require('chromeless')
const users_file='./users.csv'
const csv=require('csvtojson')
var baseUrl = process.env.PETCLINIC_BASE_URL || 'http://localhost:8081/owners/list';
var url = baseUrl
const chromeless = new Chromeless({ launchChrome: true,  waitTimeout: 30000, scrollBeforeClick: true, implicitWait: true });

async function readCSV(filename) {
  return await csv({
    noheader:true,
    headers: ['username','ip','agent']
  }).fromFile(filename);
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function run(username, ip, agent) {
    url = await chromeless
    .goto(url)
    .setExtraHTTPHeaders({
        'x-forwarded-for': ip,
        'x-forwarded-user': username,
        'x-forwarded-ip': ip,
        'user-agent': agent
    })
    .evaluate((url,baseUrl) => {
        var timer = window.setInterval(function () {
            //navigates around page dynamically
            console.log("Moving from: "+url)
            if (url.includes('vets')){
                document.querySelector('a[href^="/owners/list"]').click();
                url = document.querySelector('a[href^="/owners/list"]').href;
            } else {
                document.querySelector('a[href^="/vets"]').click();
                url = document.querySelector('a[href^="/vets"]').href;
            }
        }, 2000 );
        var uniq_links = {};
        var links = document.querySelectorAll('a[href^="/"]');
        for ( var i=0, len=links.length; i < len; i++ ) {
            uniq_links[links[i].href] = links[i];
        }
        links = new Array();
        for ( var key in uniq_links ) {
            links.push(uniq_links[key]);
        }
        if (links && links.length) {
            return links[Math.floor(Math.random()*links.length)].href;
        } else {
            return baseUrl;
        }
    }, url, baseUrl);
    console.log(url);
}

async function safe_run() {
      console.log('Starting from baseurl: '+url)
      const users = await readCSV(users_file);
      console.log(`Loaded ${users.length} users`)
      for(;;) {
          var user = users[Math.floor(Math.random() * users.length)]
          console.log('Handing ' + url)
          run(user.username,user.ip,user.agent).catch(async (error) => {
              console.log("failed for url")
              console.log(error);
          });
          await sleep(20000 + Math.floor(Math.random()*10000));
      }
}

function selectRandomIP() {
    return RANDOM_IPS[Math.floor(Math.random() * RANDOM_IPS.length)];
}

function loadRandomIPs() {
    var IPs = [];
    while (IPs.length < NUM_IPS) {
      var randomIP = randomIp();
      if (IPs.indexOf(randomIP) === -1) {
        IPs.push(randomIP);
      }
    }
    return IPs;
}


function randomByte () {
  return Math.round(Math.random()*256);
}

function isPrivate(ip) {
  return /^10\.|^192\.168\.|^172\.16\.|^172\.17\.|^172\.18\.|^172\.19\.|^172\.20\.|^172\.21\.|^172\.22\.|^172\.23\.|^172\.24\.|^172\.25\.|^172\.26\.|^172\.27\.|^172\.28\.|^172\.29\.|^172\.30\.|^172\.31\./.test(ip);
}

function randomIp() {
  var ip = randomByte() +'.' +
           randomByte() +'.' +
           randomByte() +'.' +
           randomByte();
  if (isPrivate(ip)) { return randomIp(); }
  return ip;
}

safe_run().catch(console.error.bind(console))
