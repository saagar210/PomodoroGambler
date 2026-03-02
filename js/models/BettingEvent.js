// Betting event model

export class BettingEvent {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.category = data.category;
        this.oddsYes = data.odds_yes;
        this.oddsNo = data.odds_no;
        this.isCustom = Number(data.is_custom) === 1;
        this.outcome = data.outcome;
        this.resolutionDate = data.resolution_date;
        this.isActive = data.is_active === 1;
        this.createdAt = data.created_at;
    }

    static fromDatabase(data) {
        return new BettingEvent(data);
    }
}
