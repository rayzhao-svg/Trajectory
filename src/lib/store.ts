import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import type { Plan } from "./types";

const file = path.join(process.cwd(), "data", "plans.sqlite");

let database: DatabaseSync | null = null;

function db(): DatabaseSync {
  if (!database) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    database = new DatabaseSync(file);
    database.exec(`
      create table if not exists plans (
        id text primary key,
        goal text not null,
        profile_id text not null,
        body text not null,
        created_at text not null,
        updated_at text not null
      )
    `);
  }
  return database;
}

export function savePlan(id: string, plan: Plan, createdAt?: string): void {
  const now = new Date().toISOString();
  db()
    .prepare(
      `insert into plans (id, goal, profile_id, body, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?)
       on conflict(id) do update set
         goal = excluded.goal,
         profile_id = excluded.profile_id,
         body = excluded.body,
         updated_at = excluded.updated_at`,
    )
    .run(id, plan.goal, plan.profileId, JSON.stringify(plan), createdAt ?? now, now);
}

export function readPlan(id: string): Plan | null {
  const row = db().prepare("select body from plans where id = ?").get(id) as { body: string } | undefined;
  return row ? (JSON.parse(row.body) as Plan) : null;
}
