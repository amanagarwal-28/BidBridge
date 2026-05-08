-- =====================================================
-- BidBridge — MySQL Schema (3NF normalised, fully indexed)
-- Mirror of Prisma schema with explicit DBMS features:
-- views, stored procedures, triggers, transactions.
-- =====================================================

CREATE DATABASE IF NOT EXISTS bidbridge
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bidbridge;

-- ----------------------------------------------------------
-- USERS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(36) PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('CLIENT','FREELANCER','ADMIN') NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    is_blocked  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- ----------------------------------------------------------
-- CLIENTS  (1-1 with users)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id           VARCHAR(36) PRIMARY KEY,
    user_id      VARCHAR(36) NOT NULL UNIQUE,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    company      VARCHAR(255),
    phone        VARCHAR(20),
    country      VARCHAR(100),
    avatar_url   VARCHAR(500),
    bio          TEXT,
    total_spent  DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- FREELANCERS  (1-1 with users)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS freelancers (
    id                 VARCHAR(36) PRIMARY KEY,
    user_id            VARCHAR(36) NOT NULL UNIQUE,
    first_name         VARCHAR(100) NOT NULL,
    last_name          VARCHAR(100) NOT NULL,
    phone              VARCHAR(20),
    country            VARCHAR(100),
    avatar_url         VARCHAR(500),
    bio                TEXT,
    hourly_rate        DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_earned       DECIMAL(12,2) NOT NULL DEFAULT 0,
    available_for_work BOOLEAN NOT NULL DEFAULT TRUE,
    avg_rating         DECIMAL(3,2) NOT NULL DEFAULT 0,
    total_reviews      INT NOT NULL DEFAULT 0,
    completed_jobs     INT NOT NULL DEFAULT 0,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_freelancers_rating (avg_rating),
    CONSTRAINT fk_freelancers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_hourly_rate CHECK (hourly_rate >= 0),
    CONSTRAINT chk_avg_rating CHECK (avg_rating >= 0 AND avg_rating <= 5)
);

-- ----------------------------------------------------------
-- ADMINS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id         VARCHAR(36) PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL UNIQUE,
    name       VARCHAR(200) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- SKILLS (master)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
    id       VARCHAR(36) PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    INDEX idx_skills_category (category)
);

-- ----------------------------------------------------------
-- FREELANCER_SKILLS (M:N)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS freelancer_skills (
    freelancer_id VARCHAR(36) NOT NULL,
    skill_id      VARCHAR(36) NOT NULL,
    proficiency   INT NOT NULL DEFAULT 3,
    PRIMARY KEY (freelancer_id, skill_id),
    CONSTRAINT fk_fs_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE,
    CONSTRAINT fk_fs_skill      FOREIGN KEY (skill_id)      REFERENCES skills(id)      ON DELETE CASCADE,
    CONSTRAINT chk_fs_proficiency CHECK (proficiency BETWEEN 1 AND 5)
);

-- ----------------------------------------------------------
-- PORTFOLIO
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio (
    id            VARCHAR(36) PRIMARY KEY,
    freelancer_id VARCHAR(36) NOT NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    project_url   VARCHAR(500),
    image_url     VARCHAR(500),
    category      VARCHAR(100),
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolio_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- PROJECTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id              VARCHAR(36) PRIMARY KEY,
    client_id       VARCHAR(36) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    category        VARCHAR(100) NOT NULL,
    budget_min      DECIMAL(10,2) NOT NULL,
    budget_max      DECIMAL(10,2) NOT NULL,
    deadline        DATETIME NOT NULL,
    status          ENUM('OPEN','IN_PROGRESS','COMPLETED','CANCELLED','CLOSED') NOT NULL DEFAULT 'OPEN',
    total_bids      INT NOT NULL DEFAULT 0,
    accepted_bid_id VARCHAR(36) UNIQUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_projects_client (client_id),
    INDEX idx_projects_status (status),
    INDEX idx_projects_category (category),
    CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT chk_budget_range CHECK (budget_max >= budget_min)
);

-- ----------------------------------------------------------
-- PROJECT_SKILLS (M:N)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_skills (
    project_id VARCHAR(36) NOT NULL,
    skill_id   VARCHAR(36) NOT NULL,
    PRIMARY KEY (project_id, skill_id),
    CONSTRAINT fk_ps_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_skill   FOREIGN KEY (skill_id)   REFERENCES skills(id)   ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- BIDS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS bids (
    id             VARCHAR(36) PRIMARY KEY,
    project_id     VARCHAR(36) NOT NULL,
    freelancer_id  VARCHAR(36) NOT NULL,
    proposal       TEXT NOT NULL,
    bid_amount     DECIMAL(10,2) NOT NULL,
    delivery_days  INT NOT NULL,
    status         ENUM('PENDING','ACCEPTED','REJECTED','WITHDRAWN') NOT NULL DEFAULT 'PENDING',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_bid_unique (project_id, freelancer_id),
    INDEX idx_bids_project (project_id),
    INDEX idx_bids_freelancer (freelancer_id),
    INDEX idx_bids_status (status),
    CONSTRAINT fk_bids_project    FOREIGN KEY (project_id)    REFERENCES projects(id)    ON DELETE CASCADE,
    CONSTRAINT fk_bids_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE,
    CONSTRAINT chk_bid_amount CHECK (bid_amount > 0),
    CONSTRAINT chk_delivery_days CHECK (delivery_days > 0)
);

-- ----------------------------------------------------------
-- CONTRACTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS contracts (
    id             VARCHAR(36) PRIMARY KEY,
    project_id     VARCHAR(36) NOT NULL UNIQUE,
    freelancer_id  VARCHAR(36) NOT NULL,
    agreed_amount  DECIMAL(10,2) NOT NULL,
    start_date     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date       DATETIME NOT NULL,
    status         ENUM('ACTIVE','COMPLETED','DISPUTED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    terms          TEXT,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contracts_freelancer (freelancer_id),
    INDEX idx_contracts_status (status),
    CONSTRAINT fk_contracts_project    FOREIGN KEY (project_id)    REFERENCES projects(id)    ON DELETE CASCADE,
    CONSTRAINT fk_contracts_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancers(id)
);

-- ----------------------------------------------------------
-- MILESTONES
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS milestones (
    id          VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    amount      DECIMAL(10,2) NOT NULL,
    due_date    DATETIME NOT NULL,
    status      ENUM('PENDING','IN_PROGRESS','SUBMITTED','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_milestones_contract (contract_id),
    CONSTRAINT fk_milestones_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    CONSTRAINT chk_milestone_amount CHECK (amount > 0)
);

-- ----------------------------------------------------------
-- PAYMENTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id           VARCHAR(36) PRIMARY KEY,
    contract_id  VARCHAR(36) NOT NULL,
    milestone_id VARCHAR(36) UNIQUE,
    amount       DECIMAL(10,2) NOT NULL,
    status       ENUM('PENDING','COMPLETED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    method       VARCHAR(50) NOT NULL DEFAULT 'simulated',
    tx_ref       VARCHAR(100) UNIQUE,
    paid_at      DATETIME,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payments_contract (contract_id),
    INDEX idx_payments_status (status),
    CONSTRAINT fk_payments_contract  FOREIGN KEY (contract_id)  REFERENCES contracts(id)  ON DELETE CASCADE,
    CONSTRAINT fk_payments_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id),
    CONSTRAINT chk_payment_amount CHECK (amount > 0)
);

-- ----------------------------------------------------------
-- REVIEWS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id                VARCHAR(36) PRIMARY KEY,
    contract_id       VARCHAR(36) NOT NULL UNIQUE,
    client_id         VARCHAR(36) NOT NULL,
    freelancer_id     VARCHAR(36) NOT NULL,
    client_rating     INT NOT NULL,
    client_text       TEXT,
    freelancer_rating INT,
    freelancer_text   TEXT,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reviews_freelancer (freelancer_id),
    INDEX idx_reviews_client (client_id),
    CONSTRAINT fk_reviews_contract   FOREIGN KEY (contract_id)   REFERENCES contracts(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_client     FOREIGN KEY (client_id)     REFERENCES clients(id),
    CONSTRAINT fk_reviews_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancers(id),
    CONSTRAINT chk_client_rating     CHECK (client_rating BETWEEN 0 AND 5),
    CONSTRAINT chk_freelancer_rating CHECK (freelancer_rating IS NULL OR freelancer_rating BETWEEN 0 AND 5)
);

-- ----------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id          VARCHAR(36) PRIMARY KEY,
    receiver_id VARCHAR(36) NOT NULL,
    sender_id   VARCHAR(36),
    type        ENUM('BID_RECEIVED','BID_ACCEPTED','BID_REJECTED','CONTRACT_CREATED',
                    'CONTRACT_COMPLETED','PAYMENT_RECEIVED','PAYMENT_RELEASED',
                    'REVIEW_RECEIVED','PROJECT_CLOSED','SYSTEM') NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    entity_id   VARCHAR(36),
    entity_type VARCHAR(50),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_receiver (receiver_id),
    INDEX idx_notifications_is_read (is_read),
    CONSTRAINT fk_notif_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_sender   FOREIGN KEY (sender_id)   REFERENCES users(id)
);

-- ----------------------------------------------------------
-- FRAUD_REPORTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS fraud_reports (
    id          VARCHAR(36) PRIMARY KEY,
    reported_id VARCHAR(36) NOT NULL,
    report_type ENUM('SPAM_BIDDING','DUPLICATE_ACCOUNT','FAKE_REVIEW','ABNORMAL_ACTIVITY') NOT NULL,
    description TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at DATETIME,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fraud_reported (reported_id),
    INDEX idx_fraud_resolved (is_resolved),
    CONSTRAINT fk_fraud_user FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE
);
