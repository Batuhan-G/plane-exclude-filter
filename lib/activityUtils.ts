import type { PlaneActivity, PlaneComment, TimelineEntry } from "./types";

export type ActivitySegment = { text: string; bold?: boolean };

function plainText(text: string): ActivitySegment {
  return { text };
}

function boldText(text: string): ActivitySegment {
  return { text, bold: true };
}

type ActivityValues = { old_value: string | null; new_value: string | null };
type FieldHandler = (values: ActivityValues, verb?: string) => ActivitySegment[];

const ACTIVITY_FIELD_HANDLERS: Partial<Record<string, FieldHandler>> = {
  state: ({ old_value, new_value }) => [
    plainText("changed State from "),
    boldText(old_value ?? "—"),
    plainText(" to "),
    boldText(new_value ?? "—"),
  ],
  priority: ({ new_value }) => [plainText("changed Priority to "), boldText(new_value ?? "—")],
  name: () => [plainText("changed the title")],
  description_html: () => [plainText("updated the description")],
  assignees: ({ old_value, new_value }, verb) =>
    verb === "added"
      ? [plainText("assigned "), boldText(new_value ?? "")]
      : [plainText("unassigned "), boldText(old_value ?? "")],
  label: ({ old_value, new_value }, verb) =>
    verb === "added"
      ? [plainText("added label "), boldText(new_value ?? "")]
      : [plainText("removed label "), boldText(old_value ?? "")],
};

export function formatActivity(activity: PlaneActivity): ActivitySegment[] {
  const { field, verb, old_value, new_value } = activity;

  if (!field) {
    const description = verb === "created" ? "created the issue" : (verb ?? "updated the issue");
    return [plainText(description)];
  }

  const handler = ACTIVITY_FIELD_HANDLERS[field];
  if (handler) return handler({ old_value, new_value }, verb);

  return [plainText(`updated ${field}`)];
}

export function mergeTimeline(
  activities: PlaneActivity[],
  comments: PlaneComment[],
): TimelineEntry[] {
  const activityEntries = activities.map((activity) => ({ type: "activity" as const, data: activity }));
  const commentEntries = comments.map((comment) => ({ type: "comment" as const, data: comment }));

  return [...activityEntries, ...commentEntries].sort(
    (a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime(),
  );
}
