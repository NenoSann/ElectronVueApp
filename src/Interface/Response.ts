interface BaseResponse {
    status: 'success' | 'client_fail' | 'server_fail',
    message?: string
}
interface ResponseWithOffset extends BaseResponse {
    href?: string | URL
    offset: number,
    limit: number,
    previous?: string | URL | null,
    next?: string | URL | null,
    total: number,
}
interface ItemsResponse<ObjectType> extends ResponseWithOffset {
    items: ObjectType[]
}
interface FriendsResponse extends BaseResponse {
    id: string, // the id of user being requested
    items: IFriend[], // over all items
    total: number,
}

interface IFriend {
    name: string,
    userid: string,
    avatar: string,
    online: boolean
}

export { BaseResponse, ResponseWithOffset, ItemsResponse, FriendsResponse, IFriend }