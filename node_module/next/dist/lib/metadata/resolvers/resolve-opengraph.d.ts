import type { ResolvedMetadata } from '../types/metadata-interface';
import type { OpenGraph } from '../types/opengraph-types';
import type { FieldResolverWithMetadataBase } from '../types/resolvers';
import type { Twitter } from '../types/twitter-types';
export declare function resolveImages(images: Twitter['images'], metadataBase: ResolvedMetadata['metadataBase']): NonNullable<ResolvedMetadata['twitter']>['images'];
export declare function resolveImages(images: OpenGraph['images'], metadataBase: ResolvedMetadata['metadataBase']): NonNullable<ResolvedMetadata['openGraph']>['images'];
export declare const resolveOpenGraph: FieldResolverWithMetadataBase<'openGraph'>;
export declare const resolveTwitter: FieldResolverWithMetadataBase<'twitter'>;
