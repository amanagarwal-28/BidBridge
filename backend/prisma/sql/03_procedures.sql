-- =====================================================
-- BidBridge — Stored Procedures
-- =====================================================
USE bidbridge;

DELIMITER $$

-- ──────────────────────────────────────────────
-- generate_contract: Accept a bid and create a contract atomically.
-- Demonstrates: TRANSACTION, multi-table writes, error rollback.
-- ──────────────────────────────────────────────
DROP PROCEDURE IF EXISTS generate_contract$$
CREATE PROCEDURE generate_contract(
    IN p_bid_id VARCHAR(36),
    OUT p_contract_id VARCHAR(36)
)
BEGIN
    DECLARE v_project_id    VARCHAR(36);
    DECLARE v_freelancer_id VARCHAR(36);
    DECLARE v_amount        DECIMAL(10,2);
    DECLARE v_delivery_days INT;
    DECLARE v_end_date      DATETIME;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT project_id, freelancer_id, bid_amount, delivery_days
      INTO v_project_id, v_freelancer_id, v_amount, v_delivery_days
      FROM bids
     WHERE id = p_bid_id;

    SET v_end_date = DATE_ADD(NOW(), INTERVAL v_delivery_days DAY);
    SET p_contract_id = UUID();

    -- Reject competing bids
    UPDATE bids
       SET status = 'REJECTED'
     WHERE project_id = v_project_id AND id <> p_bid_id;

    -- Accept this bid
    UPDATE bids SET status = 'ACCEPTED' WHERE id = p_bid_id;

    -- Update project
    UPDATE projects
       SET status = 'IN_PROGRESS', accepted_bid_id = p_bid_id
     WHERE id = v_project_id;

    -- Insert contract
    INSERT INTO contracts (id, project_id, freelancer_id, agreed_amount, end_date)
    VALUES (p_contract_id, v_project_id, v_freelancer_id, v_amount, v_end_date);

    COMMIT;
END$$

-- ──────────────────────────────────────────────
-- calculate_total_earnings: total earnings for a freelancer.
-- ──────────────────────────────────────────────
DROP PROCEDURE IF EXISTS calculate_total_earnings$$
CREATE PROCEDURE calculate_total_earnings(
    IN p_freelancer_id VARCHAR(36),
    OUT p_total DECIMAL(12,2)
)
BEGIN
    SELECT COALESCE(SUM(pay.amount), 0)
      INTO p_total
      FROM payments pay
      JOIN contracts c ON c.id = pay.contract_id
     WHERE c.freelancer_id = p_freelancer_id
       AND pay.status = 'COMPLETED';
END$$

-- ──────────────────────────────────────────────
-- recommend_freelancers: by skill match + rating.
-- Returns a result-set; takes the project ID.
-- ──────────────────────────────────────────────
DROP PROCEDURE IF EXISTS recommend_freelancers$$
CREATE PROCEDURE recommend_freelancers(IN p_project_id VARCHAR(36))
BEGIN
    SELECT
        f.id,
        CONCAT(f.first_name, ' ', f.last_name) AS full_name,
        f.avg_rating,
        f.completed_jobs,
        f.hourly_rate,
        COUNT(DISTINCT fs.skill_id) AS matched_skills
    FROM freelancers f
    JOIN users u ON u.id = f.user_id AND u.is_blocked = FALSE
    JOIN freelancer_skills fs ON fs.freelancer_id = f.id
    WHERE fs.skill_id IN (
        SELECT skill_id FROM project_skills WHERE project_id = p_project_id
    )
      AND f.available_for_work = TRUE
    GROUP BY f.id, f.first_name, f.last_name, f.avg_rating, f.completed_jobs, f.hourly_rate
    ORDER BY matched_skills DESC, f.avg_rating DESC, f.completed_jobs DESC
    LIMIT 10;
END$$

-- ──────────────────────────────────────────────
-- mark_milestone_paid: complete a payment and approve milestone.
-- ──────────────────────────────────────────────
DROP PROCEDURE IF EXISTS mark_milestone_paid$$
CREATE PROCEDURE mark_milestone_paid(IN p_payment_id VARCHAR(36))
BEGIN
    DECLARE v_milestone_id VARCHAR(36);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT milestone_id INTO v_milestone_id FROM payments WHERE id = p_payment_id;

    UPDATE payments
       SET status = 'COMPLETED', paid_at = NOW()
     WHERE id = p_payment_id;

    IF v_milestone_id IS NOT NULL THEN
        UPDATE milestones SET status = 'APPROVED' WHERE id = v_milestone_id;
    END IF;

    COMMIT;
END$$

DELIMITER ;
