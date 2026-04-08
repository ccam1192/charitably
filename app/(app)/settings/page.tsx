import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormField } from "@/components/neighbors/form-field";
import { getConferenceUsers } from "@/lib/data/neighbors";
import { getConferenceName } from "@/lib/data/donations";
import { getProfileByUserId } from "@/lib/data/profile";
import { SubmitButton } from "@/components/submit-button";
import { adminUpdateVolunteer, updateConferenceName, updateMyProfile } from "./actions";
import { inviteVolunteer } from "./invite-actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invited?: string }>;
}) {
  const { error, invited } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, allUsers] = await Promise.all([
    getProfileByUserId(user.id),
    getConferenceUsers(),
  ]);
  if (!profile) redirect("/onboarding");

  const conferenceName = await getConferenceName(profile.chapter_id);
  const others = allUsers.filter((u) => u.id !== user.id);
  const isAdmin = profile.role === "admin";

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted">Your profile and conference membership.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {invited ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Invitation sent to <span className="font-medium">{invited}</span>. They can use the link in
          their email to set a password and sign in—no conference ID needed.
        </div>
      ) : null}

      <section>
        <h3 className="text-sm font-medium text-foreground">Your profile</h3>
        <form
          action={updateMyProfile}
          className="mt-3 max-w-xl space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <FormField label="Name" name="full_name" defaultValue={profile.full_name ?? ""} />
          <div>
            <p className="text-sm font-medium text-foreground">Email</p>
            <p className="mt-1 text-sm text-muted">{user.email ?? profile.email ?? "—"}</p>
            <p className="mt-1 text-xs text-muted">
              Sign-in email is managed by your account provider. The conference directory may store a
              separate contact email for admins to edit.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Role</p>
            <p className="mt-1 text-sm capitalize text-muted">{profile.role}</p>
          </div>
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Save name
          </SubmitButton>
        </form>
      </section>

      {isAdmin ? (
        <section>
          <h3 className="text-sm font-medium text-foreground">Conference name</h3>
          <p className="mt-1 text-xs text-muted">
            This appears in the top left of the navigation for everyone in your conference.
          </p>
          <form
            action={updateConferenceName}
            className="mt-3 max-w-xl space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <FormField
              label="Conference name"
              name="conference_name"
              required
              defaultValue={conferenceName ?? ""}
              placeholder="e.g. St. Mary Downtown Conference"
            />
            <SubmitButton
              pendingLabel="Saving…"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Save conference name
            </SubmitButton>
          </form>
        </section>
      ) : null}

      {isAdmin ? (
        <section>
          <h3 className="text-sm font-medium text-foreground">Invite volunteers</h3>
          <form
            action={inviteVolunteer}
            className="mt-3 flex max-w-xl flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
          >
            <div className="min-w-[12rem] flex-1">
              <FormField label="Email" name="invite_email" type="email" required />
            </div>
            <div className="min-w-[12rem] flex-1">
              <FormField label="Name" name="invite_name" />
            </div>
            <SubmitButton
              pendingLabel="Sending…"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Send invitation
            </SubmitButton>
          </form>
        </section>
      ) : null}

      {isAdmin ? (
        <section>
          <h3 className="text-sm font-medium text-foreground">Volunteers</h3>
          <p className="mt-1 text-xs text-muted">
            Update other conference members. Edit your own name in &quot;Your profile&quot; above. At least
            one admin must remain in the conference.
          </p>
          <div className="mt-4 space-y-4">
            {others.length === 0 ? (
              <p className="text-sm text-muted">No other members in this conference yet.</p>
            ) : (
              others.map((v) => (
                <form
                  key={v.id}
                  action={adminUpdateVolunteer.bind(null, v.id)}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
                >
                  <div className="min-w-[12rem] flex-1">
                    <FormField label="Name" name="full_name" defaultValue={v.full_name ?? ""} />
                  </div>
                  <div className="min-w-[12rem] flex-1">
                    <label htmlFor={`email-${v.id}`} className="text-sm font-medium text-foreground">
                      Email (directory)
                    </label>
                    <input
                      id={`email-${v.id}`}
                      name="email"
                      type="email"
                      defaultValue={v.email ?? ""}
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
                    />
                  </div>
                  <div className="min-w-[10rem]">
                    <label htmlFor={`role-${v.id}`} className="text-sm font-medium text-foreground">
                      Role
                    </label>
                    <select
                      id={`role-${v.id}`}
                      name="role"
                      defaultValue={v.role}
                      className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <SubmitButton
                    pendingLabel="Saving…"
                    className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
                  >
                    Save
                  </SubmitButton>
                </form>
              ))
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
