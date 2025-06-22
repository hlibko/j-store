import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCartTables1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TYPE "cart_statuses_enum" AS ENUM ('OPEN', 'STATUS');
    `);

        await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" VARCHAR NOT NULL PRIMARY KEY,
        "user_id" VARCHAR NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "status" "cart_statuses_enum" NOT NULL DEFAULT 'OPEN'
      );
    `);

        await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "product" JSONB NOT NULL,
        "count" INTEGER NOT NULL,
        "cart_id" VARCHAR NOT NULL,
        CONSTRAINT "fk_cart_items_cart" FOREIGN KEY ("cart_id") 
          REFERENCES "carts" ("id") ON DELETE CASCADE
      );
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_carts_user_id" ON "carts" ("user_id");
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cart_items";`);
        await queryRunner.query(`DROP TABLE "carts";`);
        await queryRunner.query(`DROP TYPE "cart_statuses_enum";`);
    }
}