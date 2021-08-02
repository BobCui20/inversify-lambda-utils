import { injectable } from 'inversify';
import { ApiGatewayRequest, ILambdaContext } from './types';

@injectable()
export class LambdaContext<T = any> implements ILambdaContext {

    constructor() {
    }

    private _request?: ApiGatewayRequest<T>;

    public get request(): ApiGatewayRequest<T> {
        return this._request!;
    }

    public set request(req: ApiGatewayRequest) {
        let body;
        try {
            body = JSON.parse(req.body) as T;
            this._request = {
                ...req,
                body
            };
        } catch (err) {

        } finally {
            this._request = req;

        }

    }

}
