import log from './logger.js';

import { application } from 'express';

global.authCache = {};
/*
 * @param {application} app
 * @param {PockerBase} pb
 */
export default (app, pb) => {
    app.get(['/settings', '/'], async (req, res, next) => {
        log('info', 'User is trying to access protected route');
        if (!req.cookies.id || !req.cookies.token) {
            log('info', 'User is not logged in');
            res.redirect('/login');
            return;
        }

        log(`ID: ${req.cookies.id}`);
        //get supabase user data
        if (false && global.authCache[req.cookies.id]?.verified) {
            if (global.authCache[req.cookies.id].name) {
                log('info', 'User is saved in cache');
                next();
                return;
            }
        }

        try {
            // create a new one-off install from an existing one
            pb.authStore.save(req.cookies.token, null);
            // extra check to prevent unnecessary call in case the token is already expired or missing
            if (pb.authStore.isValid) {
                await pb.collection('users').authRefresh();
                console.log(pb.authStore);
                log('info', 'User is logged in');
                if (global.authCache[req.cookies.id])
                    global.authCache[req.cookies.id].verified = true;
                else global.authCache[req.cookies.id] = { verified: true };
                if (!pb.authStore.baseModel.name) {
                    log('info', 'User has no name');
                    res.redirect('/createName');
                    return;
                } else
                    global.authCache[req.cookies.id].name =
                        pb.authStore.baseModel.name;
                next();
            }
        } catch (_) {
            log('info', 'User is not logged in');
            res.redirect('/login');
            return;
        }
    });
    app.get(['/admin/'], async (req, res, next) => {
        log('info', 'User is trying to access admin route');
        if (!req.cookies.id || !req.cookies.token) {
            log('info', 'User is not logged in');
            res.redirect('/login');
            return;
        }
        pb.authStore.save(req.cookies.token, null);
        if (pb.authStore.isValid) {
            await pb
                .collection('users')
                .authRefresh()
                .catch((error) => {
                    log('User is not logged in');
                    log(error);
                    res.redirect('/login');
                    return;
                });
            log('info', 'User is logged in');
            console.log(pb.authStore);
            console.log(pb.authStore?.baseModel);
            console.log(pb.authStore?.baseModel?.admin);
            if (!pb.authStore?.baseModel?.admin) {
                log('info', 'User is not an admin');
                res.redirect('/');
                return;
            }
            next();
        }
    });
};
