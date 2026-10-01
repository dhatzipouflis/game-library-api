import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1790866204276 implements MigrationInterface {
    name = 'InitialSchema1790866204276'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "game" ("id" SERIAL NOT NULL, "title" character varying(150) NOT NULL, "genre" character varying(50) NOT NULL, "platform" character varying(50), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0152ed47a9e8963b5aaceb51e77" UNIQUE ("title"), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_game" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "gameId" integer NOT NULL, "addedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_user_game" UNIQUE ("userId", "gameId"), CONSTRAINT "PK_4ad0dcdcd6b1d348407ae324fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_game" ADD CONSTRAINT "FK_1786ddc11e6e542cd0cd1998b8d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_game" ADD CONSTRAINT "FK_efca7c34243bd941b730135e2c0" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_game" DROP CONSTRAINT "FK_efca7c34243bd941b730135e2c0"`);
        await queryRunner.query(`ALTER TABLE "user_game" DROP CONSTRAINT "FK_1786ddc11e6e542cd0cd1998b8d"`);
        await queryRunner.query(`DROP TABLE "user_game"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "game"`);
    }

}
