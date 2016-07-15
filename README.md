# Margaret Fetcher

[![build status](https://img.shields.io/travis/madewithlove/margaret-fetcher/master.svg?style=flat-square)](https://travis-ci.org/madewithlove/margaret-fetcher)
[![npm version](https://img.shields.io/npm/v/margaret-fetcher.svg?style=flat-square)](https://www.npmjs.com/package/margaret-fetcher)
[![npm downloads](https://img.shields.io/npm/dm/margaret-fetcher.svg?style=flat-square)](https://www.npmjs.com/package/margaret-fetcher)

Dead simple request classes for fetch.

## Usage

To use it simply create a class that extends `JsonRequest` (or `AbstractRequest`) and define requests as methods on it.
The `AbstractRequest` class comes with a method per HTTP verb (`this.get`, `this.post` etc.).

```js
import {JsonRequest} from 'margaret-fetcher';

export default class UserRequests extends JsonRequest
{
    query = {
        include: 'articles',
    };

    show(user) {
        return this.get(`users/${user}`);
    }

    update(user, attributes) {
        return this.put(`users/${user}`, attributes);
    }

    uploadImage(image) {
        const body = new FormData();
        body.append('image', image);

        return this.make('images', {
            method: 'PUT',
            body,
        });
    }
}
```

To then use those methods simply call the class anywhere:

```js
import UserRequests from './UserRequests';

const user = new UserRequests().show(3);
```

You can also use the `CrudRequest` class which already comes with methods for CRUD endpoints:

```js
import {CrudRequest} from 'margaret-fetcher';

export default class UserRequests extends CrudRequest
{
    resource = 'users';
    query = {include: 'articles'};
}
```

```js
const requests = new UserRequests();

requests.show(3);
requests.update(3, {foo: 'bar'});
requests.delete(3);
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

You can also pass callables as any option, and it will only get resolved before each request.
Useful if you need to pass options that need to be always up to date:

```js
UserRequests.withOptions({
    headers: {
        Authorization: () => `Bearer ${AuthManager.getToken()}`,
    }
})
```

### Configuring query parameters

You can configure query parameters with the same ease through these provided methods:

```js
// Override all query parameters
UserRequests.setQueryParameters({foo: 'bar'});

// Append new query parameters
UserRequests
    .withQueryParameter('foo', 'bar')
    .withQueryParameter('baz', 'qux');

UserRequests.withQueryParameters({foo: 'bar', baz: 'qux'});
```

You can also pass arrays to these methods:

```js
UserRequests.withQueryParameter('foo', ['bar', 'baz']); // ?foo[]=bar&foo[]=baz
```

### Configuring middlewares

The promise returned by `fetch` will be passed through a list of `middlewares`.
By default it will return an object of the data contained in the response. But you can add your own middlewares to perform specific logic.

```js
import {CrudRequest, parseJson, extractData} from 'margaret-fetcher';

class MyRequest extends CrudRequest {
    constructor() {
        super();

        this.setMiddlewares([
          parseJson, // Parses a JSON response
          ::this.extractAuthorizationHeader,
          extractData, // Returns the data contained in a Response object
        ]);
    }

    extractAuthorizationHeader(response) {
        const authorizationHeader = response.headers.get('Authorization');

        // Store it somewhere.

        return response;
    }
}
```

You can disable all middlewares for a given request using the `withoutMiddlewares` method:

```js
const users = new UserRequests()
    .withoutMiddlewares()
    .show(3);
```

### Extra helpers

The package also comes with some helper methods for common options:

```js
UserRequests.withBearerToken('FOOBAR').show(3)
```

You can use a function as well, like for other options:

```js
UserRequests.withBearerToken(::AuthManager.getToken).show(3)
```

### Subrequests

Request classes can be nested at will to build more complex paths.
Imagine you have an `UserRequests` and an `ArticleRequests`, and that an user can have articles, you can do this:

```js
// GET /users/1/articles/2
new UserRequests()
    .getSubrequest(new ArticleRequests(), 1)
    .show(2);
```

You can also predefine subrequests through the `subrequests` property on a request class:

```js
class UserRequests extends AbstractRequest
{
    subrequests = {
        articles: new ArticlesRequests(),  
    }; 
}
```

And then retrieve it anytime:

```js
new UserRequests().getSubrequest('articles', 1).update(2, attributes);
```

### Raw fetch requests

Sometimes you just need to bypass everything and do a raw fetch request, you can do that through the `fetch` method:

```js
class UserRequests extends AbstractRequest
{
    uploadSomething(image) {
        const body = new FormData();
        body.append('image', image);

        return this.fetch('images', {
            method: 'PUT',
            body,
        });
    }
}
```

## Testing

```bash
$ npm test
$ npm test:watch
```
