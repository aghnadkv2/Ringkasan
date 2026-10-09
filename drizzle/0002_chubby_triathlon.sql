CREATE INDEX "materials_user_created_index" ON "materials" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notes_user_updated_index" ON "notes" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_quiz_completed_index" ON "quiz_attempts" USING btree ("user_id","quiz_id","completed_at");--> statement-breakpoint
CREATE INDEX "quiz_questions_quiz_position_index" ON "quiz_questions" USING btree ("quiz_id","position");--> statement-breakpoint
CREATE INDEX "quizzes_user_created_index" ON "quizzes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "study_sessions_user_scheduled_index" ON "study_sessions" USING btree ("user_id","scheduled_at");