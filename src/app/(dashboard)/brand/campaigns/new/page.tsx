"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { campaignCreateSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Platform = "youtube" | "tiktok" | "instagram";

export default function NewCampaignPage() {
  const [saving, setSaving] = useState(false);
  const form = useForm<z.input<typeof campaignCreateSchema>>({
    resolver: zodResolver(campaignCreateSchema),
    defaultValues: {
      brand_id: "", // TODO: Get from auth context
      title: "",
      description: "",
      platform: "youtube",
      rate_per_thousand: 10,
      total_budget: 1000,
      rules: "",
    },
  });

  async function onSubmit(values: z.input<typeof campaignCreateSchema>) {
    setSaving(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      window.location.href = "/brand/campaigns";
    } catch (e) {
      console.error(e);
      alert("Error creating campaign");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">New Campaign</h1>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <label className="text-sm">Brand ID</label>
          <Input {...form.register("brand_id")} placeholder="Brand ID" />
          <p className="text-xs text-muted-foreground">{form.formState.errors.brand_id?.message}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Title</label>
          <Input {...form.register("title")} placeholder="Campaign title" />
          <p className="text-xs text-muted-foreground">{form.formState.errors.title?.message}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Description</label>
          <Textarea {...form.register("description")} placeholder="Describe your campaign" />
          <p className="text-xs text-muted-foreground">{form.formState.errors.description?.message}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Platform</label>
          <Select onValueChange={(v) => form.setValue("platform", v as Platform)} defaultValue={form.getValues("platform") as Platform}>
            <SelectTrigger>
              <SelectValue placeholder="Select a platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{(form.formState.errors.platform?.message as string) ?? ""}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Rate per 1000 views</label>
            <Input type="number" step="0.01" {...form.register("rate_per_thousand", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Total budget</label>
            <Input type="number" step="0.01" {...form.register("total_budget", { valueAsNumber: true })} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Rules</label>
          <Textarea {...form.register("rules")} placeholder="Any constraints or rules" />
        </div>
        <Button disabled={saving} type="submit">{saving ? "Creating..." : "Create"}</Button>
      </form>
    </div>
  );
}
