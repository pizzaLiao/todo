import { resolveAsArrayOrUndefined } from "../generate/utils";
import { getSocialImageFallbackMetadataBase, isStringOrURL, resolveUrl } from "./resolve-url";
const OgTypeFields = {
    article: [
        "authors",
        "tags"
    ],
    song: [
        "albums",
        "musicians"
    ],
    playlist: [
        "albums",
        "musicians"
    ],
    radio: [
        "creators"
    ],
    video: [
        "actors",
        "directors",
        "writers",
        "tags"
    ],
    basic: [
        "emails",
        "phoneNumbers",
        "faxNumbers",
        "alternateLocale",
        "audio",
        "videos"
    ]
};
export function resolveImages(images, metadataBase) {
    var _resolveAsArrayOrUndefined;
    return (_resolveAsArrayOrUndefined = resolveAsArrayOrUndefined(images)) == null ? void 0 : _resolveAsArrayOrUndefined.map((item)=>{
        if (isStringOrURL(item)) {
            return {
                url: resolveUrl(item, metadataBase)
            };
        } else {
            return {
                ...item,
                // Update image descriptor url
                url: resolveUrl(item.url, metadataBase)
            };
        }
    });
}
function getFieldsByOgType(ogType) {
    switch(ogType){
        case "article":
        case "book":
            return OgTypeFields.article;
        case "music.song":
        case "music.album":
            return OgTypeFields.song;
        case "music.playlist":
            return OgTypeFields.playlist;
        case "music.radio_station":
            return OgTypeFields.radio;
        case "video.movie":
        case "video.episode":
            return OgTypeFields.video;
        default:
            return OgTypeFields.basic;
    }
}
export const resolveOpenGraph = (openGraph, metadataBase)=>{
    if (!openGraph) return null;
    const url = resolveUrl(openGraph.url, metadataBase);
    const resolved = {
        ...openGraph
    };
    function assignProps(og) {
        const ogType = og && "type" in og ? og.type : undefined;
        const keys = getFieldsByOgType(ogType);
        for (const k of keys){
            const key = k;
            if (key in og && key !== "url") {
                const value = og[key];
                if (value) {
                    const arrayValue = resolveAsArrayOrUndefined(value);
                    resolved[key] = arrayValue;
                }
            }
        }
        const imageMetadataBase = getSocialImageFallbackMetadataBase(metadataBase);
        resolved.images = resolveImages(og.images, imageMetadataBase);
    }
    assignProps(openGraph);
    resolved.url = url;
    return resolved;
};
const TwitterBasicInfoKeys = [
    "site",
    "siteId",
    "creator",
    "creatorId",
    "description"
];
export const resolveTwitter = (twitter, metadataBase)=>{
    if (!twitter) return null;
    const resolved = {
        ...twitter,
        card: "card" in twitter ? twitter.card : "summary"
    };
    for (const infoKey of TwitterBasicInfoKeys){
        resolved[infoKey] = twitter[infoKey] || null;
    }
    const imageMetadataBase = getSocialImageFallbackMetadataBase(metadataBase);
    resolved.images = resolveImages(twitter.images, imageMetadataBase);
    if ("card" in resolved) {
        switch(resolved.card){
            case "player":
                {
                    resolved.players = resolveAsArrayOrUndefined(resolved.players) || [];
                    break;
                }
            case "app":
                {
                    resolved.app = resolved.app || {};
                    break;
                }
            default:
                break;
        }
    }
    return resolved;
};

//# sourceMappingURL=resolve-opengraph.js.map