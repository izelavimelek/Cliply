import Link from "next/link";

async function getCampaigns() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/campaigns`, { cache: "no-store" });
  if (!res.ok) return { items: [] };
  return res.json();
}

export default async function BrandCampaignsPage() {
  const data = await getCampaigns();
  const items: Array<{ id: string; title?: string; description?: string }> = data.items || [];
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Campaigns</h1>
        <Link className="underline" href="/brand/campaigns/new">New Campaign</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((c) => (
          <Link key={c.id} href={`/brand/campaigns/${c.id}`} className="border rounded-lg p-4 hover:bg-accent">
            <div className="font-medium">{c.title || c.id}</div>
            <div className="text-sm text-muted-foreground line-clamp-2">{c.description || "No description"}</div>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">No campaigns yet.</div>
        )}
      </div>
    </div>
  );
}
