import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRawgGameFields1791135786093 implements MigrationInterface {
    name = 'AddRawgGameFields1791135786093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" ADD "rawgId" integer`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "UQ_83e593e9c645a8e9e73fe056b60" UNIQUE ("rawgId")`);
        await queryRunner.query(`ALTER TABLE "game" ADD "imageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "game" ADD "releasedAt" date`);
        await queryRunner.query(`ALTER TABLE "game" ADD "metacritic" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "metacritic"`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "releasedAt"`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "UQ_83e593e9c645a8e9e73fe056b60"`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "rawgId"`);
    }

}
