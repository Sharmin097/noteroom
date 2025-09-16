import { RequestObject } from "../types/types";

export enum RequestsActions { ADD, DELETE }

export default function requestReducer(requests: RequestObject[], actions: { type: RequestsActions, payload?: any } ) {
    switch(actions.type) {
        case RequestsActions.ADD:
            return [...requests, ...actions.payload.requests]
        case RequestsActions.DELETE:
            return requests.filter(request => request.recID !== actions.payload.recID)
        default:
            return requests
    }
}