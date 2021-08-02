import { injectable, inject } from 'inversify';
import { TYPE } from './constants';
import { LambdaContext } from './context';

@injectable()
export abstract class BaseLambda {

    @inject(TYPE.LambdaContext)
    private _lambdaContext?: LambdaContext;

    protected get lambdaContext() { return this._lambdaContext!; }
}

