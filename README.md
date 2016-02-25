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
