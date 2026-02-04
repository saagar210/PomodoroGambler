// Coin balance model

export class CoinBalance {
    constructor(data) {
        this.id = data.id;
        this.balance = data.balance;
        this.lastUpdated = data.last_updated;
    }

    static fromDatabase(data) {
        return new CoinBalance(data);
    }
}
