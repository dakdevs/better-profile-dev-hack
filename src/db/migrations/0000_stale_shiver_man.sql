CREATE TABLE "users" (
                         "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                         "name" text NOT NULL,
                         "email" text NOT NULL,
                         "email_verified" boolean DEFAULT false NOT NULL,
                         "image" text,
                         "created_at" timestamp DEFAULT now() NOT NULL,
                         "updated_at" timestamp DEFAULT now() NOT NULL,
                         "role" text,
                         "banned" boolean,
                         "ban_reason" text,
                         "ban_expires" timestamp,
                         CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
                            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                            "user_id" uuid NOT NULL,
                            "account_id" text NOT NULL,
                            "provider_id" text NOT NULL,
                            "access_token" text,
                            "refresh_token" text,
                            "access_token_expires_at" timestamp,
                            "refresh_token_expires_at" timestamp,
                            "scope" text,
                            "id_token" text,
                            "password" text,
                            "created_at" timestamp DEFAULT now() NOT NULL,
                            "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
                            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                            "user_id" uuid NOT NULL,
                            "token" text NOT NULL,
                            "expires_at" timestamp NOT NULL,
                            "ip_address" text,
                            "user_agent" text,
                            "created_at" timestamp DEFAULT now() NOT NULL,
                            "updated_at" timestamp DEFAULT now() NOT NULL,
                            "impersonated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "verifications" (
                                 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                                 "identifier" text NOT NULL,
                                 "value" text NOT NULL,
                                 "expires_at" timestamp NOT NULL,
                                 "created_at" timestamp DEFAULT now() NOT NULL,
                                 "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_index" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_index" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "verifications_identifier_index" ON "verifications" USING btree ("identifier");