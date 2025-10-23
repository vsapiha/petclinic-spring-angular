const { Chromeless } = require('chromeless')
const users_file='./users.csv'
const csv=require('csvtojson')
var baseUrl = process.env.PETCLINIC_BASE_URL || 'http://localhost:3000';

async function readCSV(filename, headers) {
  return await csv({
    noheader:true,
    headers: headers
  }).fromFile(filename);
}

const chromeless = new Chromeless({ launchChrome: true,  waitTimeout: 30000, scrollBeforeClick: true, implicitWait: true });
const user_ids = Array.from(Array(10).keys())
var user_id = user_ids[Math.floor(Math.random() * user_ids.length)]+1
var url = baseUrl + `/owners/${user_id}/edit`
console.log('Handing ' + url)

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function run(username, ip, agent) {
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
      console.log('Using slow zip code as well');
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

    }, url, baseUrl);

}

async function safe_run() {
      const users = await readCSV(users_file, ['username','ip','agent']);
      console.log(`Loaded ${users.length} users`)
      var user = users[Math.floor(Math.random() * users.length)];
      run(user.username,user.ip,user.agent).catch(async (error) => {
          console.log("failed for url: " + url)
          console.log(error);
      });
}


safe_run().catch(console.error.bind(console))
