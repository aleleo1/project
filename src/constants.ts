import { Actions, Queries, type QueryParams } from "./interfaces";
import { get_DEFAULT_DATES } from "./utils";

export const DEFAULT_INITIAL_STATE: QueryParams = {
    date: get_DEFAULT_DATES()[1],
    q: Queries.default,
    num: 1,
    rif: get_DEFAULT_DATES()[0],
    action: Actions.full
}


