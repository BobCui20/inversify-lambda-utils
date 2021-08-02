import { Container } from 'inversify';
import { TYPE } from './constants';

import { AugmentedLambdaMiddleware, HttpError, LambdaMiddleware, LambdaMiddlewareParam } from './types';
import { ApiGatewayRequestRaw, ApiGatewayResponse, LambdaHandlerMeta } from './types';
import { BaseLambda } from './base-lambda';
import { LAMBDA_METAKEY } from './constants';
import { LambdaContext } from './context';
import { v4 as uuid } from 'uuid';


export class LambdaManager {

    constructor(private container: Container) {
    }

    build() {
        const handlers: { [key: string]: (req: ApiGatewayRequestRaw) => ApiGatewayResponse | Promise<ApiGatewayResponse>; } = {};
        this.container.bind<LambdaContext>(TYPE.LambdaContext).to(LambdaContext);

        const lambdaClasses = this.getAllLambdaClassesFromMeta();
        for (const lambdaClass of lambdaClasses) {
            const lambdaName = lambdaClass.name;

            if (this.container.isBoundNamed(TYPE.Lambda, lambdaName)) {
                throw new Error(`${lambdaName} has already been bound`);
            }

            this.container.bind<BaseLambda>(TYPE.Lambda)
                .to(lambdaClass)
                .inSingletonScope()
                .whenTargetNamed(lambdaName);
        }

        const lambdas = this.getAllLambdaInstanceFromContainer();
        for (const lambda of lambdas) {
            const handlerMetas = this.getAllHandlersFromMeta(Object.getPrototypeOf(lambda).constructor);
            for (const handlerMeta of handlerMetas) {
                const lambdaName = handlerMeta.target.constructor.name;
                console.log(handlerMeta.target.constructor.name);
                const handler = this.handlerFactory(lambdaName, handlerMeta.key, handlerMeta.middlewares);
                handlers[handlerMeta.name] = handler;
            }
        }
        return handlers;
    }

    private getAllLambdaClassesFromMeta(): (new () => BaseLambda)[] {
        const arrayOfControllerMetadata = Reflect.getMetadata(
            LAMBDA_METAKEY.LAMBDA,
            Reflect
        ) || [];
        return arrayOfControllerMetadata;
    }

    private getAllLambdaInstanceFromContainer() {
        const lambdas = this.container.getAll<BaseLambda>(TYPE.Lambda);
        return lambdas;
    }

    private getAllHandlersFromMeta(target: new () => BaseLambda) {
        const handlerMetas: LambdaHandlerMeta[] = Reflect.getMetadata(
            LAMBDA_METAKEY.HANDLER,
            target
        );
        return handlerMetas;
    }

    private handlerFactory(lambdaName: string, handlerName: string, middlewares: LambdaMiddlewareParam[]) {
        return async (request: ApiGatewayRequestRaw): Promise<ApiGatewayResponse> => {
            const instance = this.container.getNamed<any>(TYPE.Lambda, lambdaName);
            const context = this.container.get<LambdaContext>(TYPE.LambdaContext);
            context.request = request;
            let res;
            try {
                for (const middleware of middlewares) {
                    let instance;
                    let args;
                    if ((middleware as any).middleware) {
                        instance = this.container.get<LambdaMiddleware>((middleware as AugmentedLambdaMiddleware).middleware);
                        args = (middleware as AugmentedLambdaMiddleware).args;
                    } else {
                        instance = this.container.get<LambdaMiddleware>(middleware as (new () => LambdaMiddleware));
                    }
                    await instance.handle(context, ...(args || []));
                }
                res = await instance[handlerName](context);
                if (typeof res.body !== 'string') {
                    res.body = JSON.stringify(res.body);
                }
            } catch (err) {
                if (err instanceof HttpError) {
                    res = {
                        statusCode: err.statusCode,
                        body: {
                            statusCode: err.statusCode,
                            message: err.message,
                            errorId: err.errorId,
                            reqId: context.request.requestContext.requestId
                        },
                        headers: {
                            "Content-Type": "application/json"
                        }
                    };
                } else {
                    console.log(err);
                    const errorId = uuid();
                    res = {
                        statusCode: err.statusCode || 500,
                        body: {
                            statusCode: err.statusCode || 500,
                            message: err.message || 'Internal server error',
                            errorId: errorId,
                            reqId: context.request.requestContext.requestId
                        },
                        headers: {
                            "Content-Type": "application/json"
                        }
                    };
                }
            }
            return res;
        };
    }

}