import AbstractRequest from './AbstractRequest';
import {parseJson} from './Middlewares';

export default class JsonRequest extends AbstractRequest {

    constructor(...args) {
        super(...args);

        this.middleware = [parseJson];
        this.withOptions({
            type: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
    }

}
