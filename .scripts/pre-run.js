const { exec } = require("child_process")
const chalk = require("chalk")

exec("git config --get core.hooksPath", (error, stdout, stderr) => {
    if (!error) {
        if (stdout !== ".githooks") {
            exec("git config core.hooksPath .githooks", (error, stdout, stderr) => {
                if (error) {
                    console.log(chalk.red(`Error while setting core.hooksPath to .githooks: ${error.message}`))
                } else {
                    console.log(chalk.green(`Set core.hooksPath to .githooks`))
                }
            })
        }
    } else {
        console.log(chalk.red(`Error while getting core.hooksPath : ${error.message}`))
    }
})
