/*
Better log function 
features: 
- type of log(info,etc.)
- detection of variable types (string, number, array, object, unkown) and specific action (e.g. JSON.stringify, etc.)
- log object and array as table using console.table
- optional timestamp 
- uses chalk
*/
import chalk from 'chalk';

const color_dict = new Map([
    ['info', 'blue'],
    ['debug', 'magenta'],
    ['warn', 'yellow'],
    ['error', 'red'],
    ['success', 'green'],
    ['log', 'white'],
]);

const log_type_dict = new Map([
    ['info', console.info],
    ['debug', console.debug],
    ['warn', console.warn],
    ['error', console.error],
    ['success', console.log],
    ['log', console.log],
]);

function newTimestamp() {
    //remove first 11 characters of the string
    return new Date().toISOString().slice(11);
}

export default function log(
    type,
    message,
    timestamp = global.config.logger.timestamps,
    noFormating = false
) {
    if (!message) {
        message = type;
        type = 'log';
    }
    const color = color_dict.get(type) || 'white';
    let log_type = log_type_dict.get(type) || console.log;
    switch (typeof message) {
        case 'string':
            message = chalk[color](message);
            break;
        case 'number':
            message = chalk[color](message.toString());
            break;
        case 'object':
            //log as table
            if (noFormating) {
                if (!Array.isArray(message)) {
                    message = chalk[color](JSON.stringify(message, null, 2));
                }
            }
            //else log_type = console.table;
            else if (Array.isArray(message)) {
                log_type = console.table;
            } else {
                if (Object.keys(message).length < 5)
                    log_type = (m) => console.table(m);
            }
            break;
        default:
            message = chalk[color](message);
            break;
    }
    let logMessage = '';
    if (timestamp)
        if (typeof message === 'object')
            console.log(
                `[${newTimestamp()}]${chalk[color](`[${type.toUpperCase()}]`)}`
            );
        else
            process.stdout.write(
                `[${newTimestamp()}]${chalk[color](`[${type.toUpperCase()}]`)} `
            );
    log_type(message);
}
