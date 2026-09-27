import { getPublishedEntities } from "@/lib/queries";
import Directory from "@/components/Directory";

// Revalidate periodically so newly published entries (added by hand in
// Supabase) show up without a full redeploy.
export const revalidate = 300;

export default async function HomePage() {
  const entities = await getPublishedEntities();

  return (
    <div className="page">
      <header className="masthead">
        <p className="eyebrow">Elrond Intelligence</p>
        <h1>A directory of climate &amp; sustainability sources</h1>
        <p className="dek">
          Datasets, organizations, tools, initiatives and solutions — one
          place to get inspired, learn what&apos;s out there, and access the
          data behind it.
        </p>
      </header>

      <Directory entities={entities} />

      <p className="note">
        Auto-deploy test — every entry is manually reviewed and verified before it&apos;s
        published.
      </p>
    </div>
  );
}
