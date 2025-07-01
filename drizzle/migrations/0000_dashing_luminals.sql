CREATE TABLE `book` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`score` real,
	`synopsis` text NOT NULL,
	`publicationStatus` text NOT NULL,
	`chaptersAvailable` integer NOT NULL,
	`hidden` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text
);
--> statement-breakpoint
CREATE TABLE `bookchapter` (
	`id` integer PRIMARY KEY NOT NULL,
	`idBook` integer NOT NULL,
	`name` text NOT NULL,
	`link` text NOT NULL,
	`number` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	FOREIGN KEY (`idBook`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bookcover` (
	`id` integer PRIMARY KEY NOT NULL,
	`idBook` integer NOT NULL,
	`link` text NOT NULL,
	FOREIGN KEY (`idBook`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookcover_link_unique` ON `bookcover` (`link`);--> statement-breakpoint
CREATE TABLE `bookname` (
	`id` integer PRIMARY KEY NOT NULL,
	`idBook` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`idBook`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookname_name_unique` ON `bookname` (`name`);--> statement-breakpoint
CREATE TABLE `bookprovider` (
	`id` integer PRIMARY KEY NOT NULL,
	`idBook` integer NOT NULL,
	`name` text NOT NULL,
	`link` text NOT NULL,
	`linkApi` text,
	FOREIGN KEY (`idBook`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bookstatistic` (
	`id` integer PRIMARY KEY NOT NULL,
	`idBook` integer NOT NULL,
	FOREIGN KEY (`idBook`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `booktag` (
	`id` integer PRIMARY KEY NOT NULL,
	`idBook` integer NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	FOREIGN KEY (`idBook`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	`modifiedAt` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `userbookmark` (
	`id` integer PRIMARY KEY NOT NULL,
	`idUser` integer NOT NULL,
	`idBook` integer NOT NULL,
	`idChapter` integer,
	`status` text DEFAULT 'reading' NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	`modifiedAt` text,
	`lastReadAt` text,
	FOREIGN KEY (`idUser`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idBook`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idChapter`) REFERENCES `bookchapter`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `usercomment` (
	`id` integer PRIMARY KEY NOT NULL,
	`idUser` integer NOT NULL,
	`idBook` integer NOT NULL,
	`message` text NOT NULL,
	`like` integer DEFAULT 0 NOT NULL,
	`highlighted` integer DEFAULT false NOT NULL,
	`hidden` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` text,
	`modifiedAt` text,
	FOREIGN KEY (`idUser`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idBook`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userexcludedtag` (
	`id` integer PRIMARY KEY NOT NULL,
	`idUser` integer NOT NULL,
	`idTag` integer NOT NULL,
	FOREIGN KEY (`idUser`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idTag`) REFERENCES `booktag`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userpermission` (
	`id` integer PRIMARY KEY NOT NULL,
	`idUser` integer NOT NULL,
	`member` integer DEFAULT true NOT NULL,
	`moderator` integer DEFAULT false NOT NULL,
	`administrator` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`idUser`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userstatistic` (
	`id` integer PRIMARY KEY NOT NULL,
	`idUser` integer NOT NULL,
	`readingStatus` real,
	`contentType` real,
	`genres` real,
	FOREIGN KEY (`idUser`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
