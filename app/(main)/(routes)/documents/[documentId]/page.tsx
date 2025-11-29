"use client";
import { Cover } from "@/components/cover";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Toolbar } from "@/components/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface DocumentIdPageProps {
    params: {
        documentId: Id<"documents">;
    };
};

// Load editor with dynamic import
const Editor = dynamic(() => import("@/components/editor"), {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading editor...</div>
});

const DocumentIdPage = ({
    params
}: DocumentIdPageProps) => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const [isNewPage, setIsNewPage] = useState(false);
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [initialEditorContent, setInitialEditorContent] = useState<string | null>(null);

    // Get document from database
    const document = useQuery(api.documents.getById, {
        documentId: params.documentId,
    });

    // Mutation for updating document
    const update = useMutation(api.documents.update);

    // Debounce timer reference
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Check if we're on a new page
    useEffect(() => {
        const isNew = searchParams.get('new') === 'true';
        setIsNewPage(isNew);
    }, [searchParams]);

    // Reset state when document ID changes
    useEffect(() => {
        setIsDocumentLoaded(false);
        setInitialEditorContent(null);
    }, [params.documentId]);

    // Track document loading state and set initial content
    useEffect(() => {
        if (document !== undefined) {
            setIsDocumentLoaded(true);
            if (document && initialEditorContent === null) {
                setInitialEditorContent(document.content ? document.content : JSON.stringify([{ type: "paragraph", content: [] }]));
            }
        }
    }, [document, initialEditorContent]);

    // Function to handle content changes
    const handleContentChange = (content: string) => {
        // Update status to indicate changes are pending/saving
        setSaveStatus('saving');

        // Clear existing timeout to debounce
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set a new timeout
        saveTimeoutRef.current = setTimeout(() => {
            try {
                // Validate content
                if (!content) {
                    throw new Error("Content is empty");
                }

                // Try parsing to validate JSON
                try {
                    JSON.parse(content);
                } catch (e) {
                    console.error("Invalid JSON format:", e);
                    setSaveStatus('error');
                    setErrorMessage("Invalid content format - not saving");
                    saveTimeoutRef.current = null;
                    return;
                }

                // Log for debugging
                console.log(`Saving document content, length: ${content.length}`);

                // Save to database
                update({
                    id: params.documentId,
                    content: content
                })
                    .then(() => {
                        console.log("Document saved successfully");
                        setSaveStatus('saved');
                        setTimeout(() => setSaveStatus('idle'), 2000);
                        setErrorMessage(null);
                    })
                    .catch(error => {
                        console.error("Failed to save document:", error);
                        setSaveStatus('error');
                        setErrorMessage(`Save failed: ${error.message}`);
                    });
            } catch (error) {
                console.error("Error processing content:", error);
                setSaveStatus('error');
                setErrorMessage("Error processing content");
            } finally {
                saveTimeoutRef.current = null;
            }
        }, 1000);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Loading state
    if (document === undefined) {
        return (
            <div>
                <Cover.Skeleton />
                <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
                    <div className="space-y-4 pl-8 pt-4">
                        <Skeleton className="h-14 w-[50%]" />
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-4 w-[40%]" />
                        <Skeleton className="h-4 w-[60%]" />
                    </div>
                </div>
                <div className="text-center mt-4">Loading document...</div>
            </div>
        );
    }

    // Not found state
    if (document === null) {
        return <div className="p-4">Document not found</div>;
    }

    return (
        <div className="pb-40">
            <Cover url={document.coverImage} />
            <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
                <Toolbar initialData={document} />
                {/* Editor */}
                {isDocumentLoaded && initialEditorContent && (
                    <Editor
                        initialContent={initialEditorContent}
                        onChange={handleContentChange}
                        editable={true}
                        newPage={isNewPage}
                    />
                )}
            </div>
        </div>
    );
}

export default DocumentIdPage;