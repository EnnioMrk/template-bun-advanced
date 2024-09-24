let pb;
const result = fetch('/api/pocketbase/get-url')
    .then((res) => res.json())
    .then(({ url }) => {
        pb = new PocketBase(url);
        console.log('PocketBase URL: ' + url);
        console.log(pb);
    });

function waitForPb() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (pb) {
                clearInterval(interval);
                resolve();
            }
        }, 10);
    });
}

class cookieManager {
    get(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    set(name, value) {
        document.cookie = `${name}=${value}; path=/`;
    }
    delete(name) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    }
}

const cookies = new cookieManager();

async function loginWithGoogle() {
    const authData = await pb
        .collection('users')
        .authWithOAuth2({ provider: 'google' });

    console.log(pb.authStore.isValid);
    console.log(pb.authStore.token);
    console.log(pb.authStore.model.id);

    if (pb.authStore.isValid) {
        console.log('Logged in');
        //save token and id to cookies
        cookies.set('id', pb.authStore.model.id);
        cookies.set('token', pb.authStore.token);
        //redirect to home page
        window.location.replace('/');
    }

    // "logout" the last authenticated model
    //pb.authStore.clear();
    if (authData.error) {
        swal('Error!', userData.error.message, 'error');
    }
}

async function setName(name) {
    console.log(`Setting name to ${name}`);
    const user = await pb
        .collection('users')
        .update(pb.authStore.model.id, { name });
    console.log(user);
    if (user.error) {
        swal('Error!', user.error.message, 'error');
    } else {
        window.location.replace('/');
    }
}

async function getAuth() {
    return pb.authStore;
}

function pocketBaseReady() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (pb) {
                clearInterval(interval);
                resolve();
            }
        }, 10);
    });
}

function signOut() {
    fetch('/api/user/logout');
    pb.authStore.clear();
    //clear cookies
    cookies.delete('id');
    cookies.delete('token');
    window.location.href = '/login';
}

function isLoggedIn() {
    return pb?.authStore?.isValid;
}

function signUpWithPassword(email, name, password) {
    return new Promise(async (resolve, reject) => {
        fetch('/api/user/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, name, password }),
        })
            .then((res) => {
                if (!res.ok) {
                    res.json().then((err) => {
                        console.log("Response wasn't ok");
                        console.error(err);
                        return reject(err);
                    });
                } else return resolve();
            })
            .catch((error) => {
                console.error(error);
                return reject(error);
            });
    });
}

async function loginWithPassword(email, password) {
    return new Promise(async (resolve, reject) => {
        const authData = await pb
            .collection('users')
            .authWithPassword(email, password)
            .catch((error) => {
                console.error(error);
                return reject(error.message);
            });

        if (!pb.authStore.isValid) {
            return reject('Invalid credentials');
        }
        if (authData.error) {
            return reject(authData.error.message);
        }
        console.log('Logged in');
        //save token and id to cookies
        cookies.set('id', pb.authStore.model.id);
        cookies.set('token', pb.authStore.token);
        //redirect to home page
        window.location.replace('/');
    });
}

async function getUserData() {
    return new Promise(async (resolve, reject) => {
        fetch('/api/user/get-data')
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                resolve(data);
            })
            .catch((error) => {
                console.error(error);
                reject('error');
            });
    });
}

async function changeEmail(newEmail) {
    return new Promise(async (resolve, reject) => {
        pb.collection('users')
            .requestEmailChange(newEmail)
            .then((res) => {
                console.log(res);
                resolve();
            })
            .catch((error) => {
                console.error(error);
                reject('error');
            });
    });
}

async function changePassword(oldPassword, newPassword) {
    return new Promise(async (resolve, reject) => {
        fetch('/api/user/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ oldPassword: oldPassword, newPassword }),
        })
            .then((res) => {
                if (!res.ok) {
                    res.json().then((err) => {
                        console.log("Response wasn't ok");
                        console.error(err);
                        return reject(err);
                    });
                } else return resolve();
            })
            .catch((error) => {
                console.error(error);
                return reject(error);
            });
    });
}

async function hasPassword() {
    return new Promise(async (resolve, reject) => {
        pb.collection('users')
            .listExternalAuths(pb.authStore.model.id)
            .then((res) => {
                console.log(res);
                resolve(res.length == 0);
            })
            .catch((error) => {
                console.error(error);
                reject('error');
            });
    });
}

async function isAdmin() {
    return new Promise(async (resolve, reject) => {
        pb.collection('users')
            .isAdmin(pb.authStore.model.id)
            .then((res) => {
                console.log(res);
                resolve(res);
            })
            .catch((error) => {
                console.error(error);
                reject('error');
            });
    });
}
