-- CreateEnum
CREATE TYPE "System" AS ENUM ('Payme', 'Click', 'Uzum');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CREATED', 'PAID', 'CANCELED');

-- CreateEnum
CREATE TYPE "banner_type" AS ENUM ('dynamic', 'static');

-- CreateEnum
CREATE TYPE "config_key" AS ENUM ('config_image', 'config_images', 'config_file', 'config_files', 'config_enum', 'config_date', 'config_foreign_type', 'config_bool', 'config_string', 'config_int', 'pickPlayer_limit', 'craeteTeam_limit', 'user_balance', 'latest_player', 'sms_confirm_uz', 'sms_confirm_ru', 'useSmsConfirmation', 'isSmsTesting', 'smsTestingText', 'eskiz_token', 'MAILERSEND_API_TOKEN');

-- CreateEnum
CREATE TYPE "config_type" AS ENUM ('TextField', 'Dropdown', 'Radio', 'Checkbox');

-- CreateEnum
CREATE TYPE "customer_type" AS ENUM ('good', 'core', 'bad');

-- CreateEnum
CREATE TYPE "forma" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- CreateEnum
CREATE TYPE "formas" AS ENUM ('f3_5_2', 'f3_4_3', 'f4_3_3', 'f5_3_2', 'f5_4_1', 'f4_4_2');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "language" AS ENUM ('uz', 'ru', 'en');

-- CreateEnum
CREATE TYPE "match_status" AS ENUM ('postphoned', 'finished', 'not_started', 'in_process');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('sms', 'telegram', 'email');

-- CreateEnum
CREATE TYPE "pay_method" AS ENUM ('cash', 'terminal', 'paysys', 'bank');

-- CreateEnum
CREATE TYPE "pay_package_type" AS ENUM ('transfer_count', 'team_balance', 'single_club_count');

-- CreateEnum
CREATE TYPE "pay_system" AS ENUM ('click', 'payme', 'balance', 'uzum');

-- CreateEnum
CREATE TYPE "pay_system_ext" AS ENUM ('click', 'payme', 'uzum');

-- CreateEnum
CREATE TYPE "player_position" AS ENUM ('STR', 'MID', 'DEF', 'GOA', 'None');

-- CreateEnum
CREATE TYPE "point_action" AS ENUM ('is_lineup', 'is_lineup_more_60', 'goal', 'goal_asist', 'missed_penalty', 'every_2_missed_goals', 'red_card', 'yellow_card', 'is_shutout', 'autogoal', 'blocked_penalty');

-- CreateEnum
CREATE TYPE "position" AS ENUM ('GOA', 'DEF', 'MID', 'STR');

-- CreateEnum
CREATE TYPE "prize_type" AS ENUM ('gold', 'silver', 'bronze');

-- CreateEnum
CREATE TYPE "roles" AS ENUM ('ALL', 'admin', 'manager', 'user', 'guest');

-- CreateEnum
CREATE TYPE "status_player" AS ENUM ('injured', 'available', 'booked', 'Questionable');

-- CreateEnum
CREATE TYPE "t_tables" AS ENUM ('company', 'customer', 'customer_category', 'expense', 'expense_category', 'product', 'product_category', 'purchase', 'purchase_product', 'rental', 'rental_payment', 'rental_product', 'rental_product_return', 'rental_product_selling', 'selling', 'selling_payment', 'selling_product', 'system_config', 'system_language', 'system_notification', 'system_table', 'user', 'warehouse', 'warehouse_product', 'ALL');

-- CreateEnum
CREATE TYPE "tour_status" AS ENUM ('completed', 'not_started', 'not_started_transfer', 'in_process');

-- CreateEnum
CREATE TYPE "user_event" AS ENUM ('change_capitan', 'buy_package_transfer', 'buy_package_balance', 'buy_package_one_team', 'player_buy', 'player_sell');

-- CreateTable
CREATE TABLE "action" (
    "id" SERIAL NOT NULL,
    "position" "player_position",
    "type" "point_action",
    "point" SMALLINT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "name" VARCHAR(255),

    CONSTRAINT "action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner" (
    "id" SERIAL NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "price" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "link" VARCHAR(255),
    "content_url" VARCHAR(255),
    "name" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "deleted_by" INTEGER,
    "updated_by" INTEGER,
    "banner_type" "banner_type",
    "view_count" BIGINT,

    CONSTRAINT "advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_view" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255),
    "banner_id" INTEGER NOT NULL,
    "views" BIGINT,
    "device" VARCHAR(255),
    "country" VARCHAR(255),
    "city" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "deleted_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "banner_view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER,
    "card_type" VARCHAR(10),
    "match_id" INTEGER,
    "name" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "competition_name" VARCHAR(255),
    "name_ru" VARCHAR(255),
    "competition_id" INTEGER,
    "club_link" VARCHAR(255),
    "country_id" INTEGER,
    "native" VARCHAR(255),
    "form_img" VARCHAR(255),
    "slug" VARCHAR(255),
    "region" VARCHAR(255),
    "trainer" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "logo_img" VARCHAR(255),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "_copy_1_copy_1_copy_1_copy_1_copy_1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "location" TEXT,
    "address" TEXT,
    "inn" VARCHAR(255),
    "mfo" VARCHAR(255),
    "rs" VARCHAR(255),
    "logo" VARCHAR(255),
    "phone" VARCHAR(255),
    "website" VARCHAR(255),
    "founded" TIMESTAMPTZ(0),
    "expiration_time" TIMESTAMPTZ(6),
    "last_notified" TIMESTAMPTZ(0),
    "telegram_notification" BOOLEAN,
    "email_notification" BOOLEAN,
    "sms_notification" BOOLEAN,
    "notification_date" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition" (
    "title" VARCHAR(255) NOT NULL,
    "counter" VARCHAR(255),
    "country_id" INTEGER,
    "flag" VARCHAR(255),
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "name_ru" VARCHAR(255),
    "slug" VARCHAR(255),
    "competition_link" VARCHAR(255),
    "can_register" BOOLEAN,
    "team_count" INTEGER,
    "average_team_point" REAL,
    "sum_of_team_point" INTEGER,
    "deadline" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "_copy_2" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "flag_url" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "_copy_1_copy_1_copy_1_copy_1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" SERIAL NOT NULL,
    "home_club_id" INTEGER,
    "away_club_id" INTEGER,
    "started_date" TIMESTAMPTZ(6),
    "season_id" INTEGER,
    "postphoned_date" TIMESTAMPTZ(6),
    "winner_club_id" INTEGER,
    "finished_date" TIMESTAMPTZ(6),
    "tour_id" INTEGER,
    "name" VARCHAR(255),
    "home_club_result" SMALLINT,
    "away_club_result" SMALLINT,
    "status" "match_status",
    "competition_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "desc" TEXT,
    "image" VARCHAR(255),
    "author_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "name_ru" VARCHAR(255)
);

-- CreateTable
CREATE TABLE "pay_balance" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "user_id" INTEGER,
    "price" INTEGER,
    "system" "pay_system_ext",
    "transaction_id" INTEGER,
    "currency_code" SMALLINT,
    "state" SMALLINT,
    "updated_time" TIMESTAMPTZ(6),
    "detail" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "canceled_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "reason" INTEGER,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "status" TEXT,

    CONSTRAINT "pay_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pay_expense" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "pay_package_id" INTEGER,
    "price" INTEGER,
    "user_id" INTEGER,
    "team_id" INTEGER,
    "pay_package_type" "pay_package_type",
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "amount" REAL,
    "tour_id" INTEGER,
    "competition_id" INTEGER,
    "system" "pay_system",
    "transaction_id" INTEGER,
    "currency_code" SMALLINT,
    "state" SMALLINT,
    "updated_time" TIMESTAMPTZ(6),
    "detail" VARCHAR(255),
    "season_id" INTEGER
);

-- CreateTable
CREATE TABLE "pay_package" (
    "id" SERIAL NOT NULL,
    "name_uz" VARCHAR(255),
    "type" "pay_package_type",
    "amount" REAL,
    "priority" SMALLINT,
    "name_ru" VARCHAR(255),
    "price" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER
);

-- CreateTable
CREATE TABLE "player" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "position" "player_position" DEFAULT 'None',
    "price" REAL,
    "image" VARCHAR(255),
    "shirt_number" SMALLINT,
    "club_id" INTEGER,
    "point" INTEGER,
    "name_ru" VARCHAR(255),
    "player_link" VARCHAR(255),
    "native" VARCHAR(255),
    "slug" VARCHAR(255),
    "competition_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "team_count" INTEGER,
    "percentage" INTEGER,
    "is_actualized" BOOLEAN,
    "played_min" SMALLINT DEFAULT 0,
    "goal" SMALLINT DEFAULT 0,
    "goal_asist" SMALLINT DEFAULT 0,
    "missed_penalty" SMALLINT DEFAULT 0,
    "every_2_missed_goals" SMALLINT DEFAULT 0,
    "yellow_card" SMALLINT DEFAULT 0,
    "blocked_penalty" INTEGER DEFAULT 0,
    "autogoal" INTEGER DEFAULT 0,
    "red_card" INTEGER DEFAULT 0
);

-- CreateTable
CREATE TABLE "player_point" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER,
    "club_id" INTEGER,
    "competition_id" INTEGER,
    "match_id" INTEGER,
    "tour_id" INTEGER,
    "point" INTEGER DEFAULT 0,
    "name" VARCHAR(255),
    "goal" SMALLINT DEFAULT 0,
    "goal_asist" SMALLINT DEFAULT 0,
    "missed_penalty" SMALLINT DEFAULT 0,
    "every_2_missed_goals" SMALLINT DEFAULT 0,
    "is_red_card" SMALLINT DEFAULT 0,
    "yellow_card" SMALLINT DEFAULT 0,
    "is_lineup" SMALLINT DEFAULT 0,
    "is_shutout" SMALLINT DEFAULT 0,
    "is_lineup_more_60" SMALLINT DEFAULT 0,
    "player_result_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "season_id" INTEGER,
    "blocked_penalty" INTEGER DEFAULT 0,
    "autogoal" INTEGER DEFAULT 0,
    "match_name" VARCHAR(255)
);

-- CreateTable
CREATE TABLE "player_result" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER,
    "club_id" INTEGER,
    "played_min" SMALLINT DEFAULT 0,
    "position" "player_position",
    "competition_id" INTEGER,
    "match_id" INTEGER,
    "tour_id" INTEGER,
    "name" VARCHAR(255),
    "is_lineup" BOOLEAN DEFAULT false,
    "is_lineup_more_60" BOOLEAN DEFAULT false,
    "goal" SMALLINT DEFAULT 0,
    "goal_asist" SMALLINT DEFAULT 0,
    "missed_penalty" SMALLINT DEFAULT 0,
    "every_2_missed_goals" SMALLINT DEFAULT 0,
    "yellow_card" SMALLINT DEFAULT 0,
    "is_shutout" BOOLEAN DEFAULT false,
    "is_red_card" BOOLEAN DEFAULT false,
    "season_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "blocked_penalty" INTEGER DEFAULT 0,
    "autogoal" INTEGER DEFAULT 0,
    "match_name" VARCHAR(255)
);

-- CreateTable
CREATE TABLE "prize" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "image" VARCHAR(255),
    "competition_id" INTEGER,
    "type" "prize_type",
    "order" SMALLINT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "deleted_by" INTEGER,
    "updated_by" INTEGER,
    "name_ru" VARCHAR(255)
);

-- CreateTable
CREATE TABLE "season" (
    "id" SERIAL NOT NULL,
    "number" INTEGER,
    "name" VARCHAR(255),
    "active" BOOLEAN,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "_copy_1_copy_1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" BIGSERIAL NOT NULL,
    "key" "config_key" NOT NULL,
    "value" TEXT,
    "type" "config_type",
    "is_list" BOOLEAN,
    "group" VARCHAR(255),
    "name" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER
);

-- CreateTable
CREATE TABLE "system_language" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "uz" TEXT,
    "ru" TEXT,
    "en" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "is_exclude" BOOLEAN
);

-- CreateTable
CREATE TABLE "system_notification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "desc" TEXT,
    "read_at" TIMESTAMPTZ(6),
    "name" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "is_broadcast" BOOLEAN DEFAULT false,
    "is_sms" BOOLEAN DEFAULT false,
    "is_email" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "team" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "user_id" INTEGER,
    "competition_id" INTEGER,
    "formation" "forma" DEFAULT 4-3-3,
    "DEF" SMALLINT,
    "MID" SMALLINT,
    "STR" SMALLINT,
    "registered_tour_id" INTEGER,
    "season_id" INTEGER,
    "point" REAL DEFAULT 0,
    "order" INTEGER DEFAULT 0,
    "balance" REAL DEFAULT 100,
    "is_team_created" BOOLEAN NOT NULL DEFAULT false,
    "count_of_transfers" INTEGER DEFAULT 2,
    "transfers_from_one_team" INTEGER DEFAULT 2,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "last_tour_point" INTEGER DEFAULT 0,

    CONSTRAINT "_copy_1_copy_1_copy_1_copy_1_copy_3" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_player" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER,
    "order_number" SMALLINT,
    "is_captain" BOOLEAN DEFAULT false,
    "team_id" INTEGER,
    "position" "player_position",
    "club_id" INTEGER,
    "name" VARCHAR(255),
    "price" REAL,
    "tour_id" INTEGER,
    "competition_id" INTEGER,
    "user_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "point" SMALLINT
);

-- CreateTable
CREATE TABLE "tour" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255),
    "competition_name" VARCHAR(255),
    "season_name" VARCHAR,
    "competition_id" INTEGER,
    "season_id" INTEGER,
    "datetime_start" TIMESTAMPTZ(6),
    "status" "tour_status",
    "order" INTEGER,
    "datetime_end" TIMESTAMPTZ(0),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "is_last" BOOLEAN DEFAULT false,
    "is_copy" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "tour_team" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "tour_id" INTEGER,
    "purchased_players" SMALLINT,
    "is_purchase_locked" BOOLEAN,
    "team_id" INTEGER,
    "price" REAL,
    "point" REAL DEFAULT 0,
    "competition_id" INTEGER,
    "season_id" INTEGER,
    "captain_id" INTEGER,
    "current_count_of_transfers" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "name" VARCHAR(255),
    "is_last" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "guid" UUID,
    "company_id" INTEGER,
    "role" "roles" DEFAULT 'user',
    "name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "is_active" BOOLEAN,
    "photo" TEXT,
    "is_super_admin" BOOLEAN,
    "phone_second" VARCHAR(255),
    "phone_telegram" VARCHAR(255),
    "notes" TEXT,
    "is_developer" BOOLEAN,
    "telegram_user" VARCHAR(255),
    "grid_resize" JSONB,
    "grid_drag_drop" JSONB,
    "is_notified" BOOLEAN,
    "sms_code" VARCHAR(255),
    "sms_created_at" TIMESTAMPTZ(6),
    "last_name" TEXT,
    "middle_name" TEXT,
    "gender" TEXT,
    "birth_date" DATE,
    "bio" TEXT,
    "balance" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "language" "language" DEFAULT 'uz',
    "enable_notification" BOOLEAN DEFAULT true,
    "phone_verified" BOOLEAN,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "activity" "user_event",
    "team_id" INTEGER,
    "name_uz" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "name_ru" TEXT,
    "name_en" TEXT,
    "tour_id" INTEGER,
    "competition_id" INTEGER,
    "name" VARCHAR(255)
);

-- CreateTable
CREATE TABLE "user_prize" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "competition_id" INTEGER,
    "season_id" INTEGER,
    "team_id" INTEGER,
    "user_id" INTEGER,
    "prize_id" INTEGER,
    "team_point" INTEGER,
    "prize_order" SMALLINT,
    "updated_by" INTEGER,
    "last_tour_point" INTEGER DEFAULT 0
);

-- CreateIndex
CREATE INDEX "club_id_index" ON "club"("id");

-- CreateIndex
CREATE UNIQUE INDEX "company_name_key" ON "company"("name");

-- CreateIndex
CREATE INDEX "name_company_copy1" ON "company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "name_unique" ON "team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_idx" ON "user"("phone");

-- CreateIndex
CREATE INDEX "name_user_copy1" ON "user"("name");

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "card_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "card_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "card_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "competition" ADD CONSTRAINT "card_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "competition" ADD CONSTRAINT "card_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "competition" ADD CONSTRAINT "card_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "competition" ADD CONSTRAINT "competition_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "country" ADD CONSTRAINT "country_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "country" ADD CONSTRAINT "country_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "country" ADD CONSTRAINT "country_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE SET NULL;
