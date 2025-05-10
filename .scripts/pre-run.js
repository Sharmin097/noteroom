const { exec } = require("child_process")

const shell = process.env.SHELL || process.env.ComSpec 

if (shell.includes("bash")) {
    exec("bash ./.scripts/pre-run.sh", (error, stdout, stderr) => {
        if (error) {
            console.error(error)
            console.log(`Can't run pre-scripts`)
        } else {
            console.log(stdout)
        }
    })
} else {
    exec(".\\.scripts\\pre-run.bat", (error, stdout, stderr) => {
        if (error) {
            console.error(error)
            console.log(`Can't run pre-scripts`)
        } else {
            console.log(stdout)
        }
    })
}

