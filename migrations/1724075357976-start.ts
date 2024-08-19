import { MigrationInterface, QueryRunner } from 'typeorm';

export class Start1724075357976 implements MigrationInterface {
  name = 'Start1724075357976';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."pertimeters_type_enum" AS ENUM('commune', 'departement', 'epci')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pertimeters" ("id" character varying(32) NOT NULL, "organization_id" character varying(32) NOT NULL, "type" "public"."pertimeters_type_enum" NOT NULL, "code" text NOT NULL, CONSTRAINT "PK_61ca700208b9eb86a4a133ba021" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_perimeters_organization_id" ON "pertimeters" ("organization_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."update_status_revision" AS ENUM('rejected', 'updated', 'unchanged')`,
    );
    await queryRunner.query(
      `CREATE TABLE "revisions" ("id" character varying(32) NOT NULL, "source_id" character varying(32) NOT NULL, "harvest_id" character varying(32) NOT NULL, "file_id" character varying(32), "data_hash" text, "code_commune" text, "update_status" "public"."update_status_revision", "updateRejectionReason" text, "publication" jsonb, "validation" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4aa9ee2c71c50508c3c501573c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_revisions_source_id" ON "revisions" ("source_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_revisions_harvest_id" ON "revisions" ("harvest_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."harvests_status_enum" AS ENUM('completed', 'active', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."update_status_harvest" AS ENUM('rejected', 'updated', 'unchanged')`,
    );
    await queryRunner.query(
      `CREATE TABLE "harvests" ("id" character varying(32) NOT NULL, "source_id" character varying(32) NOT NULL, "file_id" character varying(32), "file_hash" text, "data_hash" text, "status" "public"."harvests_status_enum" NOT NULL DEFAULT 'active', "update_status" "public"."update_status_harvest", "updateRejectionReason" text, "error" text, "start_at" date, "finish_at" date, CONSTRAINT "PK_fb748ae28bc0000875b1949a0a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_harvests_source_id" ON "harvests" ("source_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sources" ("id" character varying(32) NOT NULL, "organization_id" character varying(32), "title" text NOT NULL, "url" text NOT NULL, "description" text, "license" text, "enabled" boolean DEFAULT true, "last_harvest" date, "harvestingSince" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_85523beafe5a2a6b90b02096443" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sources_organization_id" ON "sources" ("organization_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7ec8f02c782757b9ea0ea96dcf" ON "sources" ("deleted_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" ("id" character varying(32) NOT NULL, "name" text NOT NULL, "page" text NOT NULL, "logo" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5bc12ae4a6da1f7a555163e6d" ON "organizations" ("deleted_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "pertimeters" ADD CONSTRAINT "FK_b2ec86c12f4085c4998b580edb0" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "revisions" ADD CONSTRAINT "FK_7ccc943921dc5d2e3c0b84bbfa5" FOREIGN KEY ("harvest_id") REFERENCES "harvests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "revisions" ADD CONSTRAINT "FK_4ff3ffd07ca7e00f0851452cbad" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ADD CONSTRAINT "FK_d49718f0f5d86cc4ca0c7a014d8" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "FK_344fa4fb502cdfc5f32452465af" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "FK_344fa4fb502cdfc5f32452465af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" DROP CONSTRAINT "FK_d49718f0f5d86cc4ca0c7a014d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revisions" DROP CONSTRAINT "FK_4ff3ffd07ca7e00f0851452cbad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revisions" DROP CONSTRAINT "FK_7ccc943921dc5d2e3c0b84bbfa5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pertimeters" DROP CONSTRAINT "FK_b2ec86c12f4085c4998b580edb0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d5bc12ae4a6da1f7a555163e6d"`,
    );
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7ec8f02c782757b9ea0ea96dcf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sources_organization_id"`,
    );
    await queryRunner.query(`DROP TABLE "sources"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_harvests_source_id"`);
    await queryRunner.query(`DROP TABLE "harvests"`);
    await queryRunner.query(`DROP TYPE "public"."update_status_harvest"`);
    await queryRunner.query(`DROP TYPE "public"."harvests_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_revisions_harvest_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_revisions_source_id"`);
    await queryRunner.query(`DROP TABLE "revisions"`);
    await queryRunner.query(`DROP TYPE "public"."update_status_revision"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_perimeters_organization_id"`,
    );
    await queryRunner.query(`DROP TABLE "pertimeters"`);
    await queryRunner.query(`DROP TYPE "public"."pertimeters_type_enum"`);
  }
}
