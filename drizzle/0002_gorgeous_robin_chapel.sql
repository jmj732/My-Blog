ALTER TABLE "comment" ALTER COLUMN "is_deleted" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "author_id" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_author_id_idx" ON "post" USING btree ("author_id");