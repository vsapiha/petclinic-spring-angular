const { Chromeless } = require('chromeless')

var args = process.argv.slice(2);
var users_file = args[0];
var delay_per_user = args[1];
var delay_per_page = args[2];
delay_per_page = delay_per_page.split(':')
delay_per_user = delay_per_user.split(':')
//read variables
console.log('Starting loadgenerator...');
console.log('Users file: '+ users_file + ', Delay Per User: '+ delay_per_user + ', Delay Per Page: ' + delay_per_page)


const csv=require('csvtojson')
var baseUrl = process.env.PETCLINIC_BASE_URL || 'http://localhost:8081';
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
    .setUserAgent(agent)
    .goto(url)
    .setExtraHTTPHeaders({
        'x-forwarded-for': ip,
        'x-forwarded-user': username,
        'x-forwarded-ip': ip,
        'user-agent': agent
    })
    .evaluate((url,baseUrl,delay_per_page_avg, delay_per_page_dev) => {
        var delay  = delay_per_page_avg + (Math.random() * delay_per_page_dev);
        console.log(delay);
        var timer = window.setInterval(function () {
            //navigates around page dynamically
            var links = document.querySelectorAll('a[href^="/"]');
            var uniq_links = {};
            var max_length = 0;
            var min_length = Number.MAX_SAFE_INTEGER;
            // we attempt to bias longer urls
            for ( var i=0, len=links.length; i < len; i++ ) {
                uniq_links[links[i].href] = links[i];
                if (links[i].href.length < min_length) {
                    min_length = links[i].href.length;
                } else if (links[i].href.length > max_length) {
                    max_length = links[i].href.length;
                }
            }
            var diff = 10/(max_length - min_length);
            links = new Array();
            //refs = new Array();
            for ( var key in uniq_links ) {
                for (i = 0; i < (uniq_links[key].href.length - min_length + 1) * diff ; i++){
                    links.push(uniq_links[key]);
                    //refs.push(uniq_links[key].href);
                }
            }
            //console.log(refs);
            if (links && links.length) {
                var i = Math.floor(Math.random()*links.length);
                //console.log(links[i])
                links[i].click();
            } else {
                //no where to go, wait for page reload
                window.clearInterval(timer);
            }
        }, delay );
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
    }, url, baseUrl, parseInt(delay_per_page[0]), parseInt(delay_per_page[1]));
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
          await sleep(parseInt(delay_per_user[0]) + Math.floor(Math.random()*parseInt(delay_per_user[1])));
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
