"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

interface SharePopoverProps {
    documentId: Id<"documents">;
    collaborators?: string[];
}

export const SharePopover = ({ documentId, collaborators = [] }: SharePopoverProps) => {
    const { user } = useUser();
    const addCollaborator = useMutation(api.documents.addCollaborator);
    const removeCollaborator = useMutation(api.documents.removeCollaborator);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onAdd = () => {
        if (!email) return;

        setIsLoading(true);
        addCollaborator({ id: documentId, email: email })
            .then(() => {
                toast.success("Collaborator added");
                setEmail("");
            })
            .catch(() => toast.error("Failed to add collaborator"))
            .finally(() => setIsLoading(false));
    };

    const onRemove = (email: string) => {
        setIsLoading(true);
        removeCollaborator({ id: documentId, email })
            .then(() => toast.success("Collaborator removed"))
            .catch(() => toast.error("Failed to remove collaborator"))
            .finally(() => setIsLoading(false));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm" variant="ghost">
                    <Users className="h-4 w-4 mr-2" />
                    Share
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end" alignOffset={8} forceMount>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Collaborators</h4>
                        <p className="text-sm text-muted-foreground">
                            Add people to this document by email.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="h-8"
                        />
                        <Button onClick={onAdd} disabled={isLoading} size="sm" className="h-8">
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {collaborators.map((collaboratorEmail) => (
                            <div key={collaboratorEmail} className="flex items-center justify-between text-sm border p-2 rounded-md">
                                <span className="truncate max-w-[180px]">{collaboratorEmail}</span>
                                <Button
                                    onClick={() => onRemove(collaboratorEmail)}
                                    disabled={isLoading}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {collaborators.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                                No collaborators yet.
                            </p>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
