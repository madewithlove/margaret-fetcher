# Margaret Fetcher

Dead simple request classes for fetch. 

## Usage

```js
import {AbstractRequest} from 'margaret-fetcher';

class UserRequests extends AbstractRequest
{
    includes = ['articles'];

    show(user) {
        return this.get(`users/${user}`);
    }
}

export default new UserRequests;
```

```js
import UserRequests from './UserRequests';

const user = UserRequests.show(3);
```

Or through the CrudRequest class:

```js
import {CrudRequest} from 'margaret-fetcher';

class UserRequests extends CrudRequest
{
    includes = ['articles'];
    
    resource = 'users';
}

export default new UserRequests;
```

```js
import UserRequests from './UserRequests';

const user = UserRequests.show(3);
```

## Advanced usage

### Configuring options

You can configure options passed with all requests either as one time thing:

```js
// Merge options with the defaults
UserRequests.withOptions({headers: {Authorization: 'Bearer FOOBAR'}}).show(3)

// Override default options 
UserRequests.setOptions({headers: {Authorization: 'Bearer FOOBAR'}}).show(3)
```

Or through the class itself:

```js
class UserRequests extends CrudRequest {
    constructor() {
        super();

        this.withOptions({
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        });
    }
}
```
