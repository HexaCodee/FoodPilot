export const helmetOptions = {
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            scripsSrc: ["'self'", "'unsalfe-inline'"],
            styleSrc: ["'self'", "'unsalfe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc:  ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'none'"],
        }
    },
    hsts: false,
    frameguard: {action: 'deny'},
    hidePoweredBy: true,
    crossOriginResourePolicy: {policy: 'cross-origin'},
    crossOriginEmbeddedPolicy: false,
    
};