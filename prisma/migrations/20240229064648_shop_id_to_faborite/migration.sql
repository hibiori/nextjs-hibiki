/*
  Warnings:

  - A unique constraint covering the columns `[shop_id]` on the table `favorite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shop_id` to the `favorite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `favorite` ADD COLUMN `shop_id` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `favorite_shop_id_key` ON `favorite`(`shop_id`);
