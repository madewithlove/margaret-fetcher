// Type definitions for margaret-fetcher
// Definitions by: Maxime Fabre (maxime@madewithlove.be)

declare type Middleware = (response: Response) => any;
declare type Payload = any;
declare type QueryParameter = any;
declare type QueryParameters = {[key: string]: QueryParameter};
declare type Request = Promise<any>;
declare type ResourceId = number | string;

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// REQUEST CLASSES ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export class AbstractRequest {
    buildEndpoint(resouce: string): string;

    make(url: string, options: RequestInit): Request;

    fetch(url: string, body: RequestInit): Request;

    getSubrequest(subrequest: string | AbstractRequest, id: string): this;

    setOptions(options: RequestInit): this;

    withOptions(options: RequestInit): this;

    withBearerToken(token: string | Function): this;

    setQueryParameters(parameters: QueryParameters): this;

    withQueryParameter(key: string, value: QueryParameter): this;

    withQueryParameters(parameters: QueryParameters): this;

    setMiddlewares(middlewares: Middleware[]): this;

    withMiddleware(middleware: Middleware): this;

    withoutMiddlewares(): this;

    get (url: string): Request;

    put(url: string, body: RequestInit): Request;

    patch(url: string, body: RequestInit): Request;

    post(url: string, body: RequestInit): Request;

    delete(url: string): Request;

}

export class JsonRequest extends AbstractRequest {

    put(url: string, payload?: Payload): Request;

    patch(url: string, payload?: Payload): Request;

    post(url: string, payload?: Payload): Request;

}

export class CrudRequest extends JsonRequest {
    index(payload?: Payload): Request;

    store(payload?: Payload): Request;

    show(id: ResourceId): Request;

    update(id: ResourceId, payload?: Payload): Request;

    destroy(id: ResourceId): Request;
}

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// MIDDLEWARES //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export function extractData<Middleware>(response: Response): any;

export function parseJson<Middleware>(response: Response): any;

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HELPERS ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export function buildOptions(options: object): object;

export function buildQuery(components: object): object;

export function jsonParser(json: string): any;
