import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import log from './logger.js';
import fs from 'fs';

export default class webServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
    }

    async start(pb) {
        //load routes from routes folder using es6
        //example route is /routes/ingredients/new.js
        //export is an async function that takes req and res

        //log all requests
        this.app.use((req, res, next) => {
            log('info', `${req.method} ${req.url}`);
            next();
        });

        this.app.use(cookieParser());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());

        const rout_groups = fs.readdirSync('./routes');
        for (const route_group of rout_groups) {
            const route_group_name = route_group.split('.')[0];
            const routes = fs.readdirSync(`./routes/${route_group_name}`);
            for (const route of routes) {
                const route_name = route.split('.')[0];
                const route_import = await import(
                    `../routes/${route_group_name}/${route_name}.js`
                );
                this.app.use(
                    `/api/${route_group_name}/${route_name}`,
                    route_import.default(pb)
                );
            }
        }

        //(await import('./auth.js')).default(this.app, pb);
        (await import('./dist.js')).default(this.app);

        this.app.use(express.static('public'));

        this.app.listen(this.port, () => {
            log('info', `Server started on port ${this.port}`);
        });
    }
}
