-- CreateTable
CREATE TABLE "branches" (
    "branch_id" SERIAL NOT NULL,
    "branch_name" TEXT NOT NULL,
    "branch_code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("branch_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullname" TEXT,
    "token" TEXT,
    "role" TEXT NOT NULL DEFAULT 'order_taker',
    "branch_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "terminal" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "halls" (
    "hall_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "terminal" INTEGER NOT NULL DEFAULT 1,
    "branch_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "halls_pkey" PRIMARY KEY ("hall_id")
);

-- CreateTable
CREATE TABLE "tables" (
    "table_id" SERIAL NOT NULL,
    "table_number" TEXT NOT NULL,
    "hall_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "terminal" INTEGER NOT NULL DEFAULT 1,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("table_id")
);

-- CreateTable
CREATE TABLE "printers" (
    "printer_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ip_address" TEXT,
    "port" INTEGER DEFAULT 9100,
    "connection_type" TEXT NOT NULL DEFAULT 'network',
    "usb_port" TEXT,
    "printer_name" TEXT,
    "type" TEXT NOT NULL DEFAULT 'receipt',
    "terminal" INTEGER NOT NULL DEFAULT 1,
    "branch_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("printer_id")
);

-- CreateTable
CREATE TABLE "kitchens" (
    "kitchen_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "printer" TEXT,
    "branch_id" INTEGER NOT NULL,
    "terminal" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchens_pkey" PRIMARY KEY ("kitchen_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "kid" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kitchen_id" INTEGER,
    "terminal" INTEGER NOT NULL DEFAULT 1,
    "branch_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "dishes" (
    "dish_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "qnty" INTEGER NOT NULL DEFAULT 0,
    "barcode" TEXT,
    "is_available" INTEGER NOT NULL DEFAULT 1,
    "is_frequent" INTEGER NOT NULL DEFAULT 0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "category_id" INTEGER NOT NULL,
    "terminal" INTEGER NOT NULL DEFAULT 1,
    "branch_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("dish_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "branch_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" SERIAL NOT NULL,
    "order_type" TEXT NOT NULL DEFAULT 'Dine In',
    "order_status" TEXT NOT NULL DEFAULT 'Running',
    "hall_id" INTEGER,
    "table_id" INTEGER,
    "comments" TEXT,
    "terminal" INTEGER NOT NULL DEFAULT 1,
    "order_taker_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "g_total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "service_charge" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "discount_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "net_total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "payment_mode" TEXT NOT NULL DEFAULT 'Cash',
    "sts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "item_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "dish_id" INTEGER NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "branch_id" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "bills" (
    "bill_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "service_charge" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "grand_total" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "payment_method" TEXT NOT NULL DEFAULT 'Cash',
    "payment_status" TEXT NOT NULL DEFAULT 'Unpaid',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("bill_id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "description" TEXT,
    "branch_id" INTEGER,
    "terminal" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dayend" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "opening_balance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "expences" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "total_cash" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "total_easypaisa" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "total_bank" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "credit_sales" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "total_sales" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "total_receivings" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "drawings" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "closing_balance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "closing_date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closing_by" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dayend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branches_branch_code_key" ON "branches"("branch_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_branch_id_idx" ON "users"("branch_id");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "halls_branch_id_idx" ON "halls"("branch_id");

-- CreateIndex
CREATE INDEX "halls_branch_id_terminal_idx" ON "halls"("branch_id", "terminal");

-- CreateIndex
CREATE INDEX "tables_branch_id_idx" ON "tables"("branch_id");

-- CreateIndex
CREATE INDEX "tables_hall_id_idx" ON "tables"("hall_id");

-- CreateIndex
CREATE INDEX "tables_branch_id_terminal_idx" ON "tables"("branch_id", "terminal");

-- CreateIndex
CREATE UNIQUE INDEX "tables_hall_id_table_number_branch_id_terminal_key" ON "tables"("hall_id", "table_number", "branch_id", "terminal");

-- CreateIndex
CREATE INDEX "printers_branch_id_terminal_idx" ON "printers"("branch_id", "terminal");

-- CreateIndex
CREATE INDEX "printers_type_idx" ON "printers"("type");

-- CreateIndex
CREATE INDEX "kitchens_branch_id_idx" ON "kitchens"("branch_id");

-- CreateIndex
CREATE INDEX "kitchens_branch_id_terminal_idx" ON "kitchens"("branch_id", "terminal");

-- CreateIndex
CREATE UNIQUE INDEX "kitchens_code_branch_id_terminal_key" ON "kitchens"("code", "branch_id", "terminal");

-- CreateIndex
CREATE INDEX "categories_branch_id_idx" ON "categories"("branch_id");

-- CreateIndex
CREATE INDEX "categories_kitchen_id_idx" ON "categories"("kitchen_id");

-- CreateIndex
CREATE INDEX "categories_branch_id_terminal_idx" ON "categories"("branch_id", "terminal");

-- CreateIndex
CREATE INDEX "dishes_branch_id_idx" ON "dishes"("branch_id");

-- CreateIndex
CREATE INDEX "dishes_category_id_idx" ON "dishes"("category_id");

-- CreateIndex
CREATE INDEX "dishes_branch_id_terminal_idx" ON "dishes"("branch_id", "terminal");

-- CreateIndex
CREATE INDEX "customers_branch_id_idx" ON "customers"("branch_id");

-- CreateIndex
CREATE INDEX "orders_branch_id_idx" ON "orders"("branch_id");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orders_order_taker_id_idx" ON "orders"("order_taker_id");

-- CreateIndex
CREATE INDEX "orders_table_id_idx" ON "orders"("table_id");

-- CreateIndex
CREATE INDEX "orders_hall_id_idx" ON "orders"("hall_id");

-- CreateIndex
CREATE INDEX "orders_branch_id_terminal_idx" ON "orders"("branch_id", "terminal");

-- CreateIndex
CREATE INDEX "orders_order_status_idx" ON "orders"("order_status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_dish_id_idx" ON "order_items"("dish_id");

-- CreateIndex
CREATE INDEX "order_items_branch_id_idx" ON "order_items"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "bills_order_id_key" ON "bills"("order_id");

-- CreateIndex
CREATE INDEX "bills_order_id_idx" ON "bills"("order_id");

-- CreateIndex
CREATE INDEX "bills_payment_status_idx" ON "bills"("payment_status");

-- CreateIndex
CREATE INDEX "expenses_branch_id_idx" ON "expenses"("branch_id");

-- CreateIndex
CREATE INDEX "expenses_branch_id_terminal_idx" ON "expenses"("branch_id", "terminal");

-- CreateIndex
CREATE INDEX "dayend_branch_id_idx" ON "dayend"("branch_id");

-- CreateIndex
CREATE INDEX "dayend_closing_date_time_idx" ON "dayend"("closing_date_time");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "halls" ADD CONSTRAINT "halls_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "halls"("hall_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "printers" ADD CONSTRAINT "printers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kitchens" ADD CONSTRAINT "kitchens_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_kitchen_id_fkey" FOREIGN KEY ("kitchen_id") REFERENCES "kitchens"("kitchen_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "halls"("hall_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("table_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_taker_id_fkey" FOREIGN KEY ("order_taker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "dishes"("dish_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dayend" ADD CONSTRAINT "dayend_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dayend" ADD CONSTRAINT "dayend_closing_by_fkey" FOREIGN KEY ("closing_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
