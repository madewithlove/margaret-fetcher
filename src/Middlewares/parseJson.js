import {jsonParser} from '../Helpers';
import {NO_CONTENT} from '../HttpStatusCodes';

export default response => {
    // If the response is a 204, don't
    // try to parse the contents
    if (response.status === NO_CONTENT) {
        if (response.ok) {
            return response;
        }

        const error = new Error(response.statusText);
        error.response = response;

        throw error;
    }

    return response.text().then(data => {
        if (!data) {
            return response;
        }

        response.data = jsonParser(data);
        if (response.ok) {
            return response;
        }

        const error = new Error(response.statusText);
        error.response = response;
        error.data = response.data;

        throw error;
    });
};
