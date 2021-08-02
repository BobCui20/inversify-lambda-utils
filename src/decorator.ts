import { decorate, injectable } from 'inversify';
import { LambdaHandlerMeta, LambdaMiddlewareParam } from './types';
import { LAMBDA_METAKEY } from './constants';

export const lambda = () => {
    return function (target: any) {
        decorate(injectable(), target);
        const previousMetadata = Reflect.getMetadata(
            LAMBDA_METAKEY.LAMBDA,
            Reflect
        ) || [];
        const newMetadata = [target, ...previousMetadata];
        Reflect.defineMetadata(
            LAMBDA_METAKEY.LAMBDA,
            newMetadata,
            Reflect
        );
    };
};

export const handler = (name?: string, ...middlewares: LambdaMiddlewareParam[]) => {
    return function (target: any, key: string, value: any) {
        let metadata: LambdaHandlerMeta = {
            key,
            target,
            name: name || key,
            middlewares: middlewares || []
        };


        if (!Reflect.hasMetadata(LAMBDA_METAKEY.HANDLER, target.constructor)) {
            Reflect.defineMetadata(LAMBDA_METAKEY.HANDLER, [metadata], target.constructor);
        } else {
            const metadataList = Reflect.getMetadata(LAMBDA_METAKEY.HANDLER, target.constructor);
            metadataList.push(metadata);
        }

    };
};