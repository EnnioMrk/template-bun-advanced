import PocketBase from 'pocketbase';

export default class pbManager {
    constructor() {
        this.pb = new PocketBase(process.env.POCKETBASE_URL);
    }
}
