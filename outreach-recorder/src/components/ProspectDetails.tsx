import type { FileNameDetails } from "../utils/filename";

type ProspectDetailsProps = {
  details: FileNameDetails;
  onChange: (details: FileNameDetails) => void;
  prospectRequired?: boolean;
};

export function ProspectDetails({
  details,
  onChange,
  prospectRequired = false,
}: ProspectDetailsProps) {
  const update = (key: keyof FileNameDetails, value: string) => {
    onChange({ ...details, [key]: value });
  };
  const showRequired = prospectRequired && !details.prospectName.trim();

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Prospect</h2>
      </div>
      <div className="field-grid">
        <label>
          <span>Prospect name {prospectRequired ? "(required)" : ""}</span>
          <input
            value={details.prospectName}
            onChange={(event) => update("prospectName", event.target.value)}
            placeholder="e.g. Sarah Thompson"
            required={prospectRequired}
            aria-invalid={showRequired}
          />
          {showRequired && (
            <small className="field-help">
              Add the person's name so the video filename is personal and easy
              to recognise.
            </small>
          )}
        </label>
        <label>
          <span>Company name</span>
          <input
            value={details.companyName}
            onChange={(event) => update("companyName", event.target.value)}
            placeholder="e.g. Northstar Digital"
          />
        </label>
        <label>
          <span>Role / title</span>
          <input
            value={details.roleTitle}
            onChange={(event) => update("roleTitle", event.target.value)}
            placeholder="e.g. CMO"
          />
        </label>
      </div>
    </section>
  );
}
