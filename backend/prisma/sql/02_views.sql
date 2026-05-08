-- =====================================================
-- BidBridge — Views
-- =====================================================
USE bidbridge;

-- All currently open projects with bid counts and client info
DROP VIEW IF EXISTS active_projects_view;
CREATE VIEW active_projects_view AS
SELECT
    p.id              AS project_id,
    p.title,
    p.category,
    p.budget_min,
    p.budget_max,
    p.deadline,
    p.total_bids,
    p.created_at,
    c.id              AS client_id,
    CONCAT(c.first_name, ' ', c.last_name) AS client_name,
    c.country         AS client_country,
    c.total_spent     AS client_total_spent
FROM projects p
JOIN clients c ON c.id = p.client_id
WHERE p.status = 'OPEN';

-- Top freelancers ranked by reputation
DROP VIEW IF EXISTS top_freelancers_view;
CREATE VIEW top_freelancers_view AS
SELECT
    f.id,
    CONCAT(f.first_name, ' ', f.last_name) AS full_name,
    f.country,
    f.hourly_rate,
    f.avg_rating,
    f.total_reviews,
    f.completed_jobs,
    f.total_earned
FROM freelancers f
JOIN users u ON u.id = f.user_id
WHERE u.is_blocked = FALSE
  AND u.is_active = TRUE
ORDER BY f.avg_rating DESC, f.completed_jobs DESC, f.total_reviews DESC;

-- Per-freelancer earnings summary
DROP VIEW IF EXISTS freelancer_earnings_view;
CREATE VIEW freelancer_earnings_view AS
SELECT
    f.id AS freelancer_id,
    CONCAT(f.first_name,' ',f.last_name) AS full_name,
    COALESCE(SUM(CASE WHEN pay.status='COMPLETED' THEN pay.amount END), 0) AS total_earned,
    COALESCE(SUM(CASE WHEN pay.status='PENDING'   THEN pay.amount END), 0) AS pending_amount,
    COUNT(DISTINCT c.id) AS total_contracts
FROM freelancers f
LEFT JOIN contracts c ON c.freelancer_id = f.id
LEFT JOIN payments  pay ON pay.contract_id = c.id
GROUP BY f.id, f.first_name, f.last_name;

-- Project bid stats summary
DROP VIEW IF EXISTS project_bid_stats_view;
CREATE VIEW project_bid_stats_view AS
SELECT
    p.id AS project_id,
    p.title,
    COUNT(b.id) AS total_bids,
    AVG(b.bid_amount) AS avg_bid_amount,
    MIN(b.bid_amount) AS lowest_bid,
    MAX(b.bid_amount) AS highest_bid,
    AVG(b.delivery_days) AS avg_delivery_days
FROM projects p
LEFT JOIN bids b ON b.project_id = p.id
GROUP BY p.id, p.title;
