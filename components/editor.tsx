import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/core/style.css";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { useEdgeStore } from "@/lib/edgestore";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent: string;
  editable?: boolean;
  newPage?: boolean;
}

const Editor = ({ onChange, initialContent, editable = true, newPage = false }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const [loading, setLoading] = useState(true);

  // For tracking update source and preventing loops
  const isUpdatingRef = useRef(false);
  const lastContentRef = useRef("");

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  // Function to safely parse content
  const getSafeInitialBlocks = (): PartialBlock[] => {
    if (!initialContent || initialContent === "") {
      console.log("No initial content, using default empty paragraph");
      return [{ type: "paragraph", content: [] }];
    }

    try {
      const parsedContent = JSON.parse(initialContent);

      // Validate the parsed content
      if (Array.isArray(parsedContent) && parsedContent.length > 0) {
        // Make sure every block has required properties
        const validBlocks = parsedContent.filter(block => {
          return block && typeof block === 'object' && block.type;
        });

        if (validBlocks.length > 0) {
          // Store the valid content
          lastContentRef.current = JSON.stringify(validBlocks);
          return validBlocks;
        }
      }

      console.warn("Parsed content was not valid, using default");
    } catch (error) {
      console.warn("Failed to parse initial content:", error);
    }

    // Default fallback
    return [{ type: "paragraph", content: [] }];
  };

  // Create editor only once
  useEffect(() => {
    // Skip if already initialized
    if (editor) return;

    try {
      console.log("Initializing BlockNote editor");
      const safeBlocks = getSafeInitialBlocks();
      console.log("Initial blocks:", safeBlocks);

      const newEditor = BlockNoteEditor.create({
        initialContent: safeBlocks,
        uploadFile: handleUpload,
      });

      setEditor(newEditor);
      setLoading(false);
    } catch (error) {
      console.error("Failed to create editor:", error);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up change handler once editor is available
  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.onEditorContentChange(() => {
      if (isUpdatingRef.current) {
        console.log("Skipping update while already updating");
        return;
      }

      try {
        const blocks = editor.topLevelBlocks;

        // Skip empty or invalid blocks
        if (!blocks || blocks.length === 0) {
          console.warn("Editor returned empty blocks, not updating");
          return;
        }

        const jsonContent = JSON.stringify(blocks);

        // Only trigger if content actually changed
        if (jsonContent !== lastContentRef.current) {
          console.log("Content changed, updating lastContentRef");
          // Set the reference first to prevent loops
          lastContentRef.current = jsonContent;
          // Then trigger the callback
          console.log("[Editor] Content changed, triggering onChange", { length: jsonContent.length });
          onChange(jsonContent);
        }
      } catch (error) {
        console.error("Error in content change handler:", error);
      }
    });

    return unsubscribe;
  }, [editor, onChange]);

  // Handle external content updates
  useEffect(() => {
    if (!editor || !initialContent) {
      return;
    }

    // Skip if the initialContent matches what we already have
    if (initialContent === lastContentRef.current) {
      console.log("Skipping update - content already matches");
      return;
    }

    try {
      const parsedContent = JSON.parse(initialContent);

      if (Array.isArray(parsedContent) && parsedContent.length > 0) {
        console.log("Updating editor content from props");

        // Set flag before updating to prevent change handler from firing
        isUpdatingRef.current = true;

        // Store the content reference before making changes
        lastContentRef.current = initialContent;

        // Use a timeout to ensure we fully exit this execution context
        // before attempting to update the editor
        setTimeout(() => {
          try {
            editor.replaceBlocks(editor.topLevelBlocks, parsedContent);
          } catch (error) {
            console.error("Error replacing blocks:", error);
          } finally {
            // Reset after a delay to ensure rendering completes
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 100);
          }
        }, 0);
      }
    } catch (error) {
      console.warn("Failed to update editor with external content:", error);
    }
  }, [initialContent, editor]);

  if (loading) {
    return <div className="p-4 text-center">Initializing editor...</div>;
  }

  if (!editor) {
    return <div className="p-4 text-center bg-yellow-100 rounded">Failed to load editor. Please refresh the page.</div>;
  }

  return (
    <div className="editor-container">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  );
};

export default Editor;