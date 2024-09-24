import log from './logger.js';

export default (app) => {
    app.get('/dist/pocketbase', (req, res) => {
        //send node_modles/pocketbase/dist/pocketbase.umd.js
        res.sendFile('/node_modules/pocketbase/dist/pocketbase.umd.js', {
            root: process.cwd(),
        });
    });
};
