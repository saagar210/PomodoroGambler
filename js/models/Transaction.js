// Betting transaction model

export class Transaction {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id;
        this.eventId = data.event_id;
        this.betAmount = data.bet_amount;
        this.betSide = data.bet_side;
        this.oddsAtBet = data.odds_at_bet;
        this.potentialPayout = data.potential_payout;
        this.outcome = data.outcome;
        this.winnings = data.winnings;
        this.netProfit = data.net_profit;
        this.createdAt = data.created_at;
        this.resolvedAt = data.resolved_at;

        // Joined fields from betting_events
        this.eventTitle = data.event_title;
        this.eventCategory = data.event_category;
    }

    static fromDatabase(data) {
        return new Transaction(data);
    }
}
