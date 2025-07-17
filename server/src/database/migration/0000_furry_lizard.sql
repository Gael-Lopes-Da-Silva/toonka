CREATE TYPE "public"."book_type" AS ENUM('manga', 'manhua', 'manhwa', 'novel');--> statement-breakpoint
CREATE TYPE "public"."user_bookmark_status" AS ENUM('reading', 'plan_to_read', 'on_hold', 'dropped', 'completed');--> statement-breakpoint
CREATE TABLE "book" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "book_type" NOT NULL,
	"score" real,
	"synopsis" text NOT NULL,
	"publication_status" text NOT NULL,
	"chapters_available" integer NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"modified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "book_chapter" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"name" text NOT NULL,
	"link" text NOT NULL,
	"number" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"modified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "book_cover" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"link" text NOT NULL,
	CONSTRAINT "book_cover_link_unique" UNIQUE("link")
);
--> statement-breakpoint
CREATE TABLE "book_name" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "book_name_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "book_provider" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"name" text NOT NULL,
	"link" text NOT NULL,
	"link_api" text
);
--> statement-breakpoint
CREATE TABLE "book_statistic" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"modified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"token" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"modified_at" timestamp,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_bookmark" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"book_id" integer NOT NULL,
	"chapter_id" integer,
	"status" "user_bookmark_status" DEFAULT 'reading' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"modified_at" timestamp,
	"last_read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_comment" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"book_id" integer NOT NULL,
	"message" text NOT NULL,
	"like" integer DEFAULT 0 NOT NULL,
	"highlighted" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"modified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_excluded_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_permission" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"member" boolean DEFAULT true NOT NULL,
	"moderator" boolean DEFAULT false NOT NULL,
	"administrator" boolean DEFAULT false NOT NULL,
	"modified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_statistic" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"reading_status" real,
	"content_type" real,
	"genres" real
);
--> statement-breakpoint
ALTER TABLE "book_chapter" ADD CONSTRAINT "book_chapter_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_cover" ADD CONSTRAINT "book_cover_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_name" ADD CONSTRAINT "book_name_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_provider" ADD CONSTRAINT "book_provider_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_statistic" ADD CONSTRAINT "book_statistic_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_tag" ADD CONSTRAINT "book_tag_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bookmark" ADD CONSTRAINT "user_bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bookmark" ADD CONSTRAINT "user_bookmark_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bookmark" ADD CONSTRAINT "user_bookmark_chapter_id_book_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapter"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_comment" ADD CONSTRAINT "user_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_comment" ADD CONSTRAINT "user_comment_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_excluded_tag" ADD CONSTRAINT "user_excluded_tag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_excluded_tag" ADD CONSTRAINT "user_excluded_tag_tag_id_book_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."book_tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_statistic" ADD CONSTRAINT "user_statistic_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_type_idx" ON "book" USING btree ("type");--> statement-breakpoint
CREATE INDEX "book_publication_status_idx" ON "book" USING btree ("publication_status");--> statement-breakpoint
CREATE INDEX "book_deleted_at_idx" ON "book" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "book_created_at_idx" ON "book" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "book_modified_at_idx" ON "book" USING btree ("modified_at");--> statement-breakpoint
CREATE INDEX "book_chapter_book_id_idx" ON "book_chapter" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_chapter_deleted_at_idx" ON "book_chapter" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "book_chapter_created_at_idx" ON "book_chapter" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "book_chapter_modified_at_idx" ON "book_chapter" USING btree ("modified_at");--> statement-breakpoint
CREATE INDEX "book_chapter_number_idx" ON "book_chapter" USING btree ("number");--> statement-breakpoint
CREATE INDEX "book_cover_book_id_idx" ON "book_cover" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_name_book_id_idx" ON "book_name" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_provider_book_id_idx" ON "book_provider" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_statistic_book_id_idx" ON "book_statistic" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_tag_book_id_idx" ON "book_tag" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_tag_deleted_at_idx" ON "book_tag" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "book_tag_created_at_idx" ON "book_tag" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "book_tag_modified_at_idx" ON "book_tag" USING btree ("modified_at");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_deleted_at_idx" ON "user" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "user_modified_at_idx" ON "user" USING btree ("modified_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_bookmark_user_book_unique" ON "user_bookmark" USING btree ("user_id","book_id");--> statement-breakpoint
CREATE INDEX "user_bookmark_user_id_idx" ON "user_bookmark" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_bookmark_book_id_idx" ON "user_bookmark" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "user_bookmark_chapter_id_idx" ON "user_bookmark" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "user_bookmark_status_idx" ON "user_bookmark" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_bookmark_created_at_idx" ON "user_bookmark" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_bookmark_deleted_at_idx" ON "user_bookmark" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "user_bookmark_modified_at_idx" ON "user_bookmark" USING btree ("modified_at");--> statement-breakpoint
CREATE INDEX "user_bookmark_last_read_at_idx" ON "user_bookmark" USING btree ("last_read_at");--> statement-breakpoint
CREATE INDEX "user_comment_user_id_idx" ON "user_comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_comment_book_id_idx" ON "user_comment" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "user_comment_highlighted_idx" ON "user_comment" USING btree ("highlighted");--> statement-breakpoint
CREATE INDEX "user_comment_hidden_idx" ON "user_comment" USING btree ("hidden");--> statement-breakpoint
CREATE INDEX "user_comment_deleted_at_idx" ON "user_comment" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "user_comment_created_at_idx" ON "user_comment" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_comment_modified_at_idx" ON "user_comment" USING btree ("modified_at");--> statement-breakpoint
CREATE INDEX "user_comment_user_book_idx" ON "user_comment" USING btree ("user_id","book_id");--> statement-breakpoint
CREATE INDEX "user_excluded_tag_user_id_idx" ON "user_excluded_tag" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_excluded_tag_tag_id_idx" ON "user_excluded_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "user_excluded_tag_user_tag_idx" ON "user_excluded_tag" USING btree ("user_id","tag_id");--> statement-breakpoint
CREATE INDEX "user_permission_user_id_idx" ON "user_permission" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_permission_modified_at_idx" ON "user_permission" USING btree ("modified_at");--> statement-breakpoint
CREATE INDEX "user_statistic_user_id_idx" ON "user_statistic" USING btree ("user_id");