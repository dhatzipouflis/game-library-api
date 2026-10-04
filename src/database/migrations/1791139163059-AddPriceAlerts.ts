import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceAlerts1791139163059 implements MigrationInterface {
    name = 'AddPriceAlerts1791139163059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "price_alert" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "gameId" integer NOT NULL, "targetPrice" numeric(10,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "isTriggered" boolean NOT NULL DEFAULT false, "lastNotifiedPrice" numeric(10,2), "lastCheckedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_price_alert_user_game" UNIQUE ("userId", "gameId"), CONSTRAINT "PK_10a9070bcf565c5bf1ed4005f77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "price_alert" ADD CONSTRAINT "FK_e08c65f28883e4f20584f7bd2b3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "price_alert" ADD CONSTRAINT "FK_d55491abd1867148614f3fa245f" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "price_alert" DROP CONSTRAINT "FK_d55491abd1867148614f3fa245f"`);
        await queryRunner.query(`ALTER TABLE "price_alert" DROP CONSTRAINT "FK_e08c65f28883e4f20584f7bd2b3"`);
        await queryRunner.query(`DROP TABLE "price_alert"`);
    }

}
