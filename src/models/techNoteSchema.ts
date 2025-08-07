import { text, timestamp, pgTable, uuid, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./userSchema";

export const techNotesTable = pgTable("techNotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  user: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TechNotes = typeof techNotesTable.$inferSelect;
export type NewTechNotes = typeof techNotesTable.$inferInsert;
