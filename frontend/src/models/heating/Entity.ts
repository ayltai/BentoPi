export type Entity = {
    entityId   : string,
    state      : string,
    attributes : {
        [ key : string ] : any,
    },
};
