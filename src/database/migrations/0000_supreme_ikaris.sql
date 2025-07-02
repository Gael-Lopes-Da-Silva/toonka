CREATE TABLE "book" (
	"id" integer PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"score" real,
	"synopsis" text NOT NULL,
	"publication_status" text NOT NULL,
	"chapters_available" integer NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bookchapter" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_book" integer NOT NULL,
	"name" text NOT NULL,
	"link" text NOT NULL,
	"number" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bookcover" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_book" integer NOT NULL,
	"link" text NOT NULL,
	CONSTRAINT "bookcover_link_unique" UNIQUE("link")
);
--> statement-breakpoint
CREATE TABLE "bookname" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_book" integer NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "bookname_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bookprovider" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_book" integer NOT NULL,
	"name" text NOT NULL,
	"link" text NOT NULL,
	"link_api" text
);
--> statement-breakpoint
CREATE TABLE "bookstatistic" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_book" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booktag" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_book" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"modified_at" timestamp,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "userbookmark" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_user" integer NOT NULL,
	"id_book" integer NOT NULL,
	"id_chapter" integer,
	"status" text DEFAULT 'reading' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"modified_at" timestamp,
	"last_read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "usercomment" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_user" integer NOT NULL,
	"id_book" integer NOT NULL,
	"message" text NOT NULL,
	"like" integer DEFAULT 0 NOT NULL,
	"highlighted" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"modified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "userexcludedtag" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_user" integer NOT NULL,
	"id_tag" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userpermission" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_user" integer NOT NULL,
	"member" boolean DEFAULT true NOT NULL,
	"moderator" boolean DEFAULT false NOT NULL,
	"administrator" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userstatistic" (
	"id" integer PRIMARY KEY NOT NULL,
	"id_user" integer NOT NULL,
	"reading_status" real,
	"content_type" real,
	"genres" real
);
--> statement-breakpoint
ALTER TABLE "bookchapter" ADD CONSTRAINT "bookchapter_id_book_book_id_fk" FOREIGN KEY ("id_book") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookcover" ADD CONSTRAINT "bookcover_id_book_book_id_fk" FOREIGN KEY ("id_book") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookname" ADD CONSTRAINT "bookname_id_book_book_id_fk" FOREIGN KEY ("id_book") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookprovider" ADD CONSTRAINT "bookprovider_id_book_book_id_fk" FOREIGN KEY ("id_book") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookstatistic" ADD CONSTRAINT "bookstatistic_id_book_book_id_fk" FOREIGN KEY ("id_book") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booktag" ADD CONSTRAINT "booktag_id_book_book_id_fk" FOREIGN KEY ("id_book") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userbookmark" ADD CONSTRAINT "userbookmark_id_user_user_id_fk" FOREIGN KEY ("id_user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userbookmark" ADD CONSTRAINT "userbookmark_id_book_book_id_fk" FOREIGN KEY ("id_book") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userbookmark" ADD CONSTRAINT "userbookmark_id_chapter_bookchapter_id_fk" FOREIGN KEY ("id_chapter") REFERENCES "public"."bookchapter"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usercomment" ADD CONSTRAINT "usercomment_id_user_user_id_fk" FOREIGN KEY ("id_user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usercomment" ADD CONSTRAINT "usercomment_id_book_book_id_fk" FOREIGN KEY ("id_book") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userexcludedtag" ADD CONSTRAINT "userexcludedtag_id_user_user_id_fk" FOREIGN KEY ("id_user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userexcludedtag" ADD CONSTRAINT "userexcludedtag_id_tag_booktag_id_fk" FOREIGN KEY ("id_tag") REFERENCES "public"."booktag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userpermission" ADD CONSTRAINT "userpermission_id_user_user_id_fk" FOREIGN KEY ("id_user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userstatistic" ADD CONSTRAINT "userstatistic_id_user_user_id_fk" FOREIGN KEY ("id_user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;