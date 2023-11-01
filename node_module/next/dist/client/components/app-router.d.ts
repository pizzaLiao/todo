import type { ReactNode } from 'react';
import React from 'react';
import type { ErrorComponent } from './error-boundary';
import { ServerActionDispatcher } from './router-reducer/router-reducer-types';
import { InitialRouterStateParameters } from './router-reducer/create-initial-router-state';
export declare function getServerActionDispatcher(): ServerActionDispatcher | null;
export declare function urlToUrlWithoutFlightMarker(url: string): URL;
declare type AppRouterProps = Omit<Omit<InitialRouterStateParameters, 'isServer' | 'location'>, 'initialParallelRoutes'> & {
    initialHead: ReactNode;
    assetPrefix: string;
    notFound: React.ReactNode | undefined;
    notFoundStyles?: React.ReactNode | undefined;
    asNotFound?: boolean;
};
export default function AppRouter(props: AppRouterProps & {
    globalErrorComponent: ErrorComponent;
}): JSX.Element;
export {};
