// User model

export class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.totalCoinsEarned = data.total_coins_earned;
        this.totalCoinsSpent = data.total_coins_spent;
        this.createdAt = data.created_at;
    }

    static fromDatabase(data) {
        return new User(data);
    }
}
