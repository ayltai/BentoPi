import type { BaseModel, } from './BaseModel';

export type Minutely = BaseModel & {
    rain          : number,
    snow          : number,
    precipitation : number,
};
