-- CreateTable
CREATE TABLE `TelegramUser` (
    `id` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` CHAR(36) NOT NULL,
    `siteOrderId` VARCHAR(64) NOT NULL,
    `productCode` VARCHAR(64) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL,
    `status` ENUM('pending_payment', 'paid', 'access_pending', 'access_granted', 'payment_failed', 'expired', 'refunded', 'chargeback') NOT NULL DEFAULT 'pending_payment',
    `telegramUserId` BIGINT NOT NULL,
    `webpayOrderId` VARCHAR(64) NULL,
    `webpayInvoiceNumber` VARCHAR(64) NULL,
    `webpayTransactionId` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `refundedAt` DATETIME(3) NULL,
    `chargebackAt` DATETIME(3) NULL,
    `lastPaymentCheckAt` DATETIME(3) NULL,

    UNIQUE INDEX `Order_siteOrderId_key`(`siteOrderId`),
    UNIQUE INDEX `Order_webpayTransactionId_key`(`webpayTransactionId`),
    INDEX `Order_telegramUserId_status_idx`(`telegramUserId`, `status`),
    INDEX `Order_status_expiresAt_idx`(`status`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentEvent` (
    `id` CHAR(36) NOT NULL,
    `eventType` VARCHAR(32) NOT NULL DEFAULT 'webpay_notification',
    `transactionId` VARCHAR(64) NULL,
    `siteOrderId` VARCHAR(64) NOT NULL,
    `webpayOrderId` VARCHAR(64) NULL,
    `orderId` CHAR(36) NULL,
    `amount` DECIMAL(10, 2) NULL,
    `currency` CHAR(3) NULL,
    `paymentMethod` VARCHAR(64) NULL,
    `paymentType` VARCHAR(16) NULL,
    `signatureValid` BOOLEAN NOT NULL DEFAULT false,
    `accepted` BOOLEAN NOT NULL DEFAULT false,
    `rejectionReason` VARCHAR(191) NULL,
    `processedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PaymentEvent_transactionId_key`(`transactionId`),
    INDEX `PaymentEvent_siteOrderId_processedAt_idx`(`siteOrderId`, `processedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessGrant` (
    `id` CHAR(36) NOT NULL,
    `orderId` CHAR(36) NOT NULL,
    `telegramUserId` BIGINT NOT NULL,
    `status` ENUM('pending', 'invite_created', 'join_requested', 'access_granted', 'revoked', 'rejected', 'failed') NOT NULL DEFAULT 'pending',
    `inviteLinkHash` CHAR(64) NULL,
    `inviteLinkCiphertext` TEXT NULL,
    `inviteLinkIv` VARCHAR(32) NULL,
    `inviteLinkAuthTag` VARCHAR(32) NULL,
    `inviteExpiresAt` DATETIME(3) NULL,
    `claimLeaseUntil` DATETIME(3) NULL,
    `joinRequestedAt` DATETIME(3) NULL,
    `grantedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AccessGrant_orderId_key`(`orderId`),
    UNIQUE INDEX `AccessGrant_inviteLinkHash_key`(`inviteLinkHash`),
    INDEX `AccessGrant_telegramUserId_status_inviteExpiresAt_idx`(`telegramUserId`, `status`, `inviteExpiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TelegramUpdate` (
    `updateId` BIGINT NOT NULL,
    `status` VARCHAR(24) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`updateId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_telegramUserId_fkey` FOREIGN KEY (`telegramUserId`) REFERENCES `TelegramUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentEvent` ADD CONSTRAINT `PaymentEvent_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessGrant` ADD CONSTRAINT `AccessGrant_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessGrant` ADD CONSTRAINT `AccessGrant_telegramUserId_fkey` FOREIGN KEY (`telegramUserId`) REFERENCES `TelegramUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
