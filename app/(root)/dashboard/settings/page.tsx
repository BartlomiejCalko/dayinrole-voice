"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">Manage your subscription and profile via Clerk.</div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href="/subscription">Manage Subscription</Link></Button>
            <Button asChild><Link href="/">Go to Home</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage; 