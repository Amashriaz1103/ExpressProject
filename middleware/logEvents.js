const { format } = require('date-fns');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const logEvents = async (message, logName) => {
    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logItem = `${dateTime}\t${uuidv4()}\t${message}\n`;

    try {
        const logDir = path.join(__dirname,'..', 'logs');
        if (!fs.existsSync(logDir)) {
            await fsPromises.mkdir(logDir);
        }
        await fsPromises.appendFile(path.join(logDir, logName), logItem);
    } catch (err) {
        console.error(`Error writing to log file: ${err}`);
    }
};

const logger =(req,res,next)=>{
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`,'reqLog.txt')
    console.log(`${req.url}\t${req.method}`)
    next()
}

module.exports = {logger,logEvents};
