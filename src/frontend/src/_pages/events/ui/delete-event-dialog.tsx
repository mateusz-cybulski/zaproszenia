"use client";

import { Trash } from "lucide-react";

import type { Event } from "@/entities/event";
import { Button } from "@/shared/ui/button";
import { DeleteChoiceDialog } from "@/shared/ui/delete-choice-dialog";

import { deleteEventAction } from "../api/delete-event-action";
import { deleteCopy } from "../config/messages";

export function DeleteEventDialog({ event }: { event: Event }) {
  return (
    <DeleteChoiceDialog
      trigger={
        <Button variant="destructive" size="sm" className="ml-auto">
          <Trash /> Usuń<span className="sr-only"> {event.name}</span>
        </Button>
      }
      title={`Usunąć wydarzenie „${event.name}”?`}
      description={deleteCopy.description}
      soft={{ title: deleteCopy.softTitle, description: deleteCopy.softDescription }}
      permanent={{ title: deleteCopy.permanentTitle, description: deleteCopy.permanentDescription }}
      remove={(permanent) => deleteEventAction(event.id, permanent)}
    />
  );
}
