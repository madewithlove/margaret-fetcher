import AbstractRequest from './AbstractRequest';
import {parseJson} from './Middlewares';

export default class JsonRequest extends AbstractRequest {

    constructor(...args) {
        super(...args);

        this.middlewares = [parseJson];
        this.withOptions({
            type: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
    }

    //////////////////////////////////////////////////////////////////////
    ////////////////////////////// REQUESTS //////////////////////////////
    //////////////////////////////////////////////////////////////////////

    put(url, payload) {
        return this.make(url, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }

    patch(url, payload) {
        return this.make(url, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    post(url, payload) {
        return this.make(url, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

}
