"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SubmitPage() {
  const params = useParams<{ campaignId: string }>();
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: params.campaignId, post_url: url }),
      });
      if (!res.ok) throw new Error("Failed");
      const s = await res.json();
      await fetch(`/api/submissions/${s.id}/verify`, { method: "POST" });
      alert("Submitted! Verification started.");
    } catch (e) {
      console.error(e);
      alert("Error submitting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">Submit to Campaign {params.campaignId}</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste your post URL" />
        <Button disabled={saving} type="submit">{saving ? "Submitting..." : "Submit"}</Button>
      </form>
    </div>
  );
}
