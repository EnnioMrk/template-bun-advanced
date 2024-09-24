import dotenv from 'dotenv';
dotenv.config();
import webServer from './managers/web-server.js';
import pbManager from './managers/pocketbase.js';
import config from './config.js';
import log from './managers/logger.js';

global.config = config;

log('info', 'Starting server...');

const web_server = new webServer();
const pb_manager = new pbManager();

web_server.start(pb_manager.pb);

process
    .on('uncaughtException', function (err) {
        console.log('Caught exception: ' + err);
        console.log(err.stack);
    })
    .on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at:', p, 'reason:', reason);
    });
