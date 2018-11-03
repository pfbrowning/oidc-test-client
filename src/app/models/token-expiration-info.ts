import { Moment } from 'moment';

export class TokenExpirationInfo {
    constructor(
        public readonly expiration: Moment,
        public readonly expired: boolean,
        public readonly expiresIn: number
    ) {}
}
