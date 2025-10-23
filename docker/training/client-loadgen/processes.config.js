module.exports = {
    apps : [{
        name: "chrome",
        script: "google-chrome",
        args: "--remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 --disable-gpu --headless",
        exec_interpreter: "none",
        exec_mode: "fork",
        restart_delay: 2000
    }, {
        name: "base_worker",
        script: "./tasks.js",
        args: "users.csv '20000:10000' '1000:1000'",
        instances: 1,
    }, {
        name: "edit_owner_worker",
        script: "./edit_owner.js",
        instances: 1,
    }, {
        name: "windows_worker",
        script: "./tasks.js",
        args: "windows_users.csv '120000:20000' '10000:10000'",
        instances: 1,
    }]
}
