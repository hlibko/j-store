import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1718539200000 implements MigrationInterface {
    name = 'InitialMigration1718539200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for cart statuses
        await queryRunner.query(`CREATE TYPE "public"."cart_status_enum" AS ENUM('OPEN', 'STATUS')`);
        
        // Create carts table with default timestamps
        await queryRunner.query(`
            CREATE TABLE "carts" (
                "id" character varying NOT NULL,
                "user_id" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "status" "public"."cart_status_enum" NOT NULL DEFAULT 'OPEN',
                CONSTRAINT "PK_carts" PRIMARY KEY ("id")
            )
        `);
        
        // Create cart_items table with JSON product column
        await queryRunner.query(`
            CREATE TABLE "cart_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "count" integer NOT NULL,
                "cart_id" character varying,
                "product" jsonb NOT NULL,
                CONSTRAINT "PK_cart_items" PRIMARY KEY ("id")
            )
        `);
        
        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            ADD CONSTRAINT "FK_cart_items_cart" 
            FOREIGN KEY ("cart_id") 
            REFERENCES "carts"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_cart"`);
        
        // Drop tables
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        
        // Drop enum type
        await queryRunner.query(`DROP TYPE "public"."cart_status_enum"`);
    }
}