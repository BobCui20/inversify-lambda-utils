import { v4 as uuid } from 'uuid';

export interface ILambdaContext<T = any, L = any> {

    get request();

    set request(req: ApiGatewayRequest<T>);

    get locals(): L;

}


export interface ApiGatewayRequestRaw {

    version: string;
    routeKey: string;
    rawPath: string;
    rawQueryString: string;
    queryStringParameters: { [key: string]: string; };
    pathParameters: { [key: string]: string; };
    headers: { [key: string]: string; };
    requestContext: ApiGatewayRequestContext;
    body: string;
    isBase64Encoded: boolean;

}

export interface ApiGatewayRequest<T = any> {

    version: string;
    routeKey: string;
    rawPath: string;
    rawQueryString: string;
    queryStringParameters: { [key: string]: string; };
    pathParameters: { [key: string]: string; };
    headers: { [key: string]: string; };
    requestContext: ApiGatewayRequestContext;
    body: T;
    isBase64Encoded: boolean;

}

export interface ApiGatewayRequestContext {
    accountId: string;
    apiId: string;
    authorizer: ApiGatewayAuthorizer;
    domainName: string;
    domainPrefix: string;
    http: ApiGatewayRequestContextHttp;
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
}

export interface ApiGatewayAuthorizer {
    jwt: ApiGatewayAuthorizerJwt;
}

export interface ApiGatewayAuthorizerJwt {
    claims: ApiGatewayAuthorizerJwtClaims;
    scopes: string[];
}

export interface ApiGatewayAuthorizerJwtClaims {
    auth_time: string;
    client_id: string;
    exp: string;
    iat: string;
    iss: string;
    jti: string;
    sub: string;
    token_use: string;
    username: string;
    version: string;
}

export interface ApiGatewayRequestContextHttp {
    method: string;
    path: string;
    protocol: string;
    sourceIp: string;
    userAgent: string;
}

export type StatusCode = number;

export interface ApiGatewayResponse {

    statusCode: StatusCode;
    body?: any;
    headers: { [key: string]: string; };

}


export interface LambdaMeta {

}

export interface LambdaHandlerMeta {
    key: string;
    target: any;
    name: string;
    middlewares: LambdaMiddlewareParam[];
}


export class HttpError extends Error {
    public readonly statusCode: number;
    public readonly errorId: string;
    public readonly parentError?: Error;


    constructor(message: string = 'Internal Server Error', statusCode: number = 500, parentError?: Error) {
        super(message);
        this.statusCode = statusCode;
        this.errorId = uuid();
        this.parentError = parentError;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}


export type LambdaMiddlewareParam = (new () => LambdaMiddleware) | AugmentedLambdaMiddleware;

export interface AugmentedLambdaMiddleware {

    middleware: new () => LambdaMiddleware;
    args: any[];
}

export interface LambdaMiddleware {

    handle(context: ILambdaContext, ...args: any[]): void;

}