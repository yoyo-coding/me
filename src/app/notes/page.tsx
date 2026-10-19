import type { Metadata } from "next";
import { getAllNotes } from "@/lib/content";
import { formatNoteTime } from "@/lib/format";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Notes",
  description: "短想法、随手记录与未成文的思考",
  alternates: {
    canonical: "/notes",
  },
};

export const dynamic = "force-static";

export default async function NotesPage() {
  const notes = await getAllNotes();

  return (
    <>
      <section className="yoyo-content yoyo-page-header">
        <h1 className="t-h2 yoyo-page-title">Notes</h1>
        <p className="t-body yoyo-page-desc">短想法、随手记录与未成文的思考</p>
      </section>

      <Reveal className="yoyo-content yoyo-section">
        {notes.length === 0 ? (
          <p className="yoyo-empty">还没有随感。想法会在这里慢慢积累。</p>
        ) : (
          <div className="yoyo-notes-timeline">
            {notes.map((note) => (
              <div key={note.slug} className="yoyo-note-item">
                <time className="yoyo-note-time" dateTime={note.createdAt}>
                  {formatNoteTime(note.createdAt)}
                </time>
                <div>
                  <p className="yoyo-note-text">{note.content}</p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="yoyo-note-tags" aria-label="标签">
                      {note.tags.map((tag) => (
                        <span key={tag} className="yoyo-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </>
  );
}
