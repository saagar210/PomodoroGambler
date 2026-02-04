// Work session model

export class WorkSession {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id;
        this.startTime = data.start_time;
        this.endTime = data.end_time;
        this.durationMinutes = data.duration_minutes;
        this.multiplier = data.multiplier;
        this.coinsEarned = data.coins_earned;
        this.status = data.status;
        this.createdAt = data.created_at;
    }

    static fromDatabase(data) {
        return new WorkSession(data);
    }
}
