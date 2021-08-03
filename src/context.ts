import { injectable } from 'inversify';
import { ApiGatewayRequest, ILambdaContext } from './types';

@injectable()
export class LambdaContext<T = any, L = any> implements ILambdaContext {
    constructor() {
    }

    private _locals: L = {} as L;

    public get locals() { return this._locals; }

    private _request?: ApiGatewayRequest<T>;

    public get request(): ApiGatewayRequest<T> {
        return this._request!;
    }

    public set request(req: ApiGatewayRequest) {
        let body;
        try {
            body = JSON.parse(req.body);
            this._request = {
                ...req,
                body
            };
        } catch (err) {
            this._request = { ...req };
        }
    }

}
