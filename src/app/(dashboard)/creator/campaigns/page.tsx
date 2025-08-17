async function getCampaigns() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/campaigns`, { cache: "no-store" });
  if (!res.ok) return { items: [] };
  return res.json();
}

export default async function CreatorDiscoveryPage() {
  const data = await getCampaigns();
  const items: Array<{ id: string; title?: string; description?: string }> = data.items || [];
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Discover Campaigns</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((c) => (
          <div key={c.id} className="border rounded-lg p-4">
            <div className="font-medium">{c.title || c.id}</div>
            <div className="text-sm text-muted-foreground line-clamp-2">{c.description || "No description"}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">No campaigns yet.</div>
        )}
      </div>
    </div>
  );
}
