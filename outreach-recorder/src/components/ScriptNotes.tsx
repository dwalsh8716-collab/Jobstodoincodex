type ScriptNotesProps = {
  notes: string;
  onChange: (notes: string) => void;
};

export function ScriptNotes({ notes, onChange }: ScriptNotesProps) {
  return (
    <section className="panel script-panel">
      <div className="panel-heading">
        <h2>Notes</h2>
      </div>
      <textarea
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste your short reminder here."
      />
    </section>
  );
}
