"use client";

import { Trash } from "lucide-react";

import type { Event } from "@/entities/event";
import { Button } from "@/shared/ui/button";
import { DeleteChoiceDialog } from "@/shared/ui/delete-choice-dialog";

import { deleteEventAction } from "../api/delete-event-action";
import { DELETE_COPY } from "../config/messages";

export function DeleteEventDialog({ event }: { event: Event }) {
  return (
    <DeleteChoiceDialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Usuń: ${event.name}`}>
          <Trash />
        </Button>
      }
      title={`Usunąć wydarzenie „${event.name}”?`}
      description={DELETE_COPY.description}
      soft={{ title: DELETE_COPY.softTitle, description: DELETE_COPY.softDescription }}
      permanent={{
        title: DELETE_COPY.permanentTitle,
        description: DELETE_COPY.permanentDescription,
      }}
      remove={(permanent) => deleteEventAction(event.id, permanent)}
    />
  );
}
