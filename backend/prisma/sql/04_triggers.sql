-- =====================================================
-- BidBridge — Triggers
-- =====================================================
USE bidbridge;

DELIMITER $$

-- 1. After a bid is inserted, increment project total_bids.
DROP TRIGGER IF EXISTS trg_bid_after_insert$$
CREATE TRIGGER trg_bid_after_insert
AFTER INSERT ON bids
FOR EACH ROW
BEGIN
    UPDATE projects SET total_bids = total_bids + 1 WHERE id = NEW.project_id;
END$$

-- 2. When a payment is marked COMPLETED, accumulate freelancer earnings,
--    and update client total spent.  Demonstrates derived attribute maintenance.
DROP TRIGGER IF EXISTS trg_payment_after_update$$
CREATE TRIGGER trg_payment_after_update
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    DECLARE v_freelancer_id VARCHAR(36);
    DECLARE v_client_id     VARCHAR(36);

    IF OLD.status <> 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
        SELECT c.freelancer_id, p.client_id
          INTO v_freelancer_id, v_client_id
          FROM contracts c
          JOIN projects p ON p.id = c.project_id
         WHERE c.id = NEW.contract_id;

        UPDATE freelancers
           SET total_earned = total_earned + NEW.amount
         WHERE id = v_freelancer_id;

        UPDATE clients
           SET total_spent = total_spent + NEW.amount
         WHERE id = v_client_id;

        -- Auto notification to the freelancer
        INSERT INTO notifications (id, receiver_id, type, title, message, entity_id, entity_type)
        SELECT UUID(), u.id, 'PAYMENT_RECEIVED',
               'Payment received',
               CONCAT('A payment of $', NEW.amount, ' was released to your wallet.'),
               NEW.id, 'payment'
          FROM freelancers f JOIN users u ON u.id = f.user_id
         WHERE f.id = v_freelancer_id;
    END IF;
END$$

-- 3. When a contract is marked COMPLETED, increment freelancer completed_jobs counter.
DROP TRIGGER IF EXISTS trg_contract_after_update$$
CREATE TRIGGER trg_contract_after_update
AFTER UPDATE ON contracts
FOR EACH ROW
BEGIN
    IF OLD.status <> 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
        UPDATE freelancers
           SET completed_jobs = completed_jobs + 1
         WHERE id = NEW.freelancer_id;

        UPDATE projects
           SET status = 'COMPLETED'
         WHERE id = NEW.project_id;
    END IF;
END$$

-- 4. After a review is inserted, recompute freelancer's avg_rating.
DROP TRIGGER IF EXISTS trg_review_after_insert$$
CREATE TRIGGER trg_review_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE freelancers f
       SET f.avg_rating    = (SELECT AVG(client_rating) FROM reviews WHERE freelancer_id = NEW.freelancer_id AND client_rating > 0),
           f.total_reviews = (SELECT COUNT(*) FROM reviews WHERE freelancer_id = NEW.freelancer_id AND client_rating > 0)
     WHERE f.id = NEW.freelancer_id;
END$$

-- 5. Notify the client whenever a new bid is placed on their project.
DROP TRIGGER IF EXISTS trg_bid_notify_client$$
CREATE TRIGGER trg_bid_notify_client
AFTER INSERT ON bids
FOR EACH ROW
BEGIN
    DECLARE v_user_id VARCHAR(36);
    DECLARE v_title   VARCHAR(255);

    SELECT u.id, p.title
      INTO v_user_id, v_title
      FROM projects p
      JOIN clients c ON c.id = p.client_id
      JOIN users u   ON u.id = c.user_id
     WHERE p.id = NEW.project_id;

    INSERT INTO notifications (id, receiver_id, sender_id, type, title, message, entity_id, entity_type)
    SELECT UUID(), v_user_id, u2.id, 'BID_RECEIVED',
           'A new bid has arrived',
           CONCAT('A freelancer placed a bid of $', NEW.bid_amount, ' on project "', v_title, '"'),
           NEW.project_id, 'project'
      FROM freelancers f JOIN users u2 ON u2.id = f.user_id
     WHERE f.id = NEW.freelancer_id;
END$$

DELIMITER ;
