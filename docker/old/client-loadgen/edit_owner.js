const { Chromeless } = require('chromeless')
const users_file='./users.csv'
const zip_code_file='./zip_codes.csv'
const csv=require('csvtojson')
var baseUrl = process.env.PETCLINIC_BASE_URL || 'http://localhost:3000';

async function readCSV(filename, headers) {
  return await csv({
    noheader:true,
    headers: headers
  }).fromFile(filename);
}

var NUM_IPS = 1000;
var RANDOM_IPS = loadRandomIPs();

const chromeless = new Chromeless({ launchChrome: true,  waitTimeout: 30000, scrollBeforeClick: true, implicitWait: true });

const user_ids = Array.from(Array(10).keys())
var user_id = user_ids[Math.floor(Math.random() * user_ids.length)]+1
var url = baseUrl + `/owners/${user_id}/edit`

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function run(username, ip, agent, zip_code) {
    console.log('Using username: '+ username+ ', ip: '+ip+ ', agent: '+agent)
    await chromeless
    .goto(url)
    .setExtraHTTPHeaders({
        'x-forwarded-for': ip,
        'x-forwarded-user': username,
        'x-forwarded-ip': ip,
        'user-agent': agent
    })
    .evaluate((url, baseUrl, zip_code) => {

      function delay(fn, t) {
        // private instance variables
        var queue = [], self, timer;
        function schedule(fn, t) {
            timer = setTimeout(function() {
                timer = null;
                fn();
                if (queue.length) {
                    var item = queue.shift();
                    schedule(item.fn, item.t);
                }
            }, t);
        }
        self = {
            delay: function(fn, t) {
                // if already queuing things or running a timer,
                //   then just add to the queue
                if (queue.length || timer) {
                    queue.push({fn: fn, t: t});
                } else {
                    // no queue or timer yet, so schedule the timer
                    schedule(fn, t);
                }
                return self;
            },
            cancel: function() {
                clearTimeout(timer);
                queue = [];
                return self;
            }
        };
        return self.delay(fn, t);
      }
      function random() {
        return 3000 + Math.floor(Math.random()*2000);
      }
      var slow_zip = Math.random();
      if (slow_zip < 0.05) {
          console.log('Using error zip code');
          if (slow_zip < 0.01) {
              console.log('Using slow zip code as well');
              //1% of the time we really slow the system down!
              //e.g. 1123231111123232222222222-111111112323111111111111112a
              var chars = "0123456789";
              var string_length = Math.floor(29+(Math.random()));
              zip_code = '';
              var rnum =0;
              for (var i=0; i<string_length; i++) {
                rnum = Math.floor(Math.random() * chars.length);
                zip_code += chars.substring(rnum,rnum+1);
              }
              zip_code += '-';
              string_length = Math.floor(29+(Math.random()));
              for (var i=0; i<string_length; i++) {
                rnum = Math.floor(Math.random() * chars.length);
                zip_code += chars.substring(rnum,rnum+1);
              }
              chars = "abcdefghijklmnopqrstuvwxyz";
              rnum = Math.floor(Math.random() * chars.length);
              zip_code+=chars.substring(rnum,rnum+1);

          } else {
              //5% of calls send a bad zip code
              zip_code +=  Math.random().toString(36).substring((Math.random()*10));
          }
      }
      console.log('Zip code: '+zip_code);
      var d = delay( () => { document.querySelector('input[name="zipCode"]').value = zip_code }, random() ).
      delay( () => { document.querySelector('input[name="zipCode"]').dispatchEvent(new Event('blur', { bubbles: true })) }, random() ).
      delay( () => {
        num_states = document.querySelector('select[name="state"]').options.length;
        document.querySelector('select[name="state"]').selectedIndex = Math.floor((Math.random() * (num_states-1)) + 1);
        document.querySelector('select[name="state"]').dispatchEvent(new Event('change', { bubbles: true }));
      }, random() ).
      delay( () => {
        num_cities = document.querySelector('select[name="city"]').options.length;
        document.querySelector('select[name="city"]').selectedIndex = Math.floor((Math.random() * (num_cities-1)) + 1);
        document.querySelector('select[name="city"]').dispatchEvent(new Event('change', { bubbles: true }));
      },random()).
      delay( () => {
        owner_editor = document.querySelector('#owner_editor')
        window.FindReact = function(dom) {
            for (var key in dom) {
                if (key.startsWith("__reactInternalInstance$")) {
                    var compInternals = dom[key]._currentElement;
                    var compWrapper = compInternals._owner;
                    var comp = compWrapper._instance;
                    return comp;
                }
            }
            return null;
        };
        FindReact(owner_editor).state["owner"]["address"] = document.querySelector('select[name="city"]').value + ' ';
        document.querySelector('.react-autosuggest__input').dispatchEvent(new Event('focus',{bubble: true }));
      },random()).
      delay( () => {
        suggestions = document.querySelectorAll('.react-autosuggest__suggestion').length;
        document.querySelectorAll('.react-autosuggest__suggestion')[Math.floor(Math.random() * suggestions)].click();
      },random()).
      delay ( () => {
        document.querySelectorAll('button[type="submit"]')[0].click();
      },random());

    }, url, baseUrl, zip_code);

}

async function safe_run() {
      const users = await readCSV(users_file, ['username','ip','agent']);
      const zip_codes = await readCSV(zip_code_file, ['zip_code']);
      console.log(`Loaded ${users.length} users`)
      console.log(`Loaded ${zip_codes.length} zip codes`)
      for(;;) {
          var user = users[Math.floor(Math.random() * users.length)];
          var zip_code = zip_codes[Math.floor(Math.random() * zip_codes.length)];
          console.log('Handing ' + url)
          run(user.username,user.ip,user.agent,zip_code.zip_code).catch(async (error) => {
              console.log("failed for url: " + url)
              console.log(error);
          });

          await sleep(60000 + Math.floor(Math.random()*10000));
          user_id = user_ids[Math.floor(Math.random() * user_ids.length)]+1;
          url = baseUrl + `/owners/${user_id}/edit`;
          console.log(url);
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
