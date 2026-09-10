import { addInterest, deleteInterest } from "./actions";
import { Empty } from "./qualification-section";
import type { Interest } from "@/lib/profile/get-professional-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function InterestSection({
  items,
  profilePath,
}: {
  items: Interest[];
  profilePath: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Interests</CardTitle>
        <CardDescription>
          Add specializations and areas of professional interest.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={addInterest} className="flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="profilePath" value={profilePath} />
          <Input
            name="name"
            maxLength={100}
            required
            placeholder="Add a professional interest"
          />
          <Button type="submit">Add Interest</Button>
        </form>
        {items.length === 0 ? (
          <Empty>No professional interests added yet.</Empty>
        ) : (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {items.map((item) => (
              <form key={item.id} action={deleteInterest}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="profilePath" value={profilePath} />
                <Badge variant="secondary" className="h-7 gap-2 pr-1">
                  {item.name}
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${item.name}`}
                  >
                    x
                  </Button>
                </Badge>
              </form>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
