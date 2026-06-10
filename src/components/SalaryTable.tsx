import type { SalarySnapshot } from "@/lib/types";

export function SalaryTable({ snapshot }: { snapshot: SalarySnapshot }) {
  return (
    <div className="salary-table-wrap">
      <table className="salary-table">
        <caption>{snapshot.title}</caption>
        <thead>
          <tr>
            <th>Role</th>
            <th>Low</th>
            <th>Mid</th>
            <th>High</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.rows.map((row) => (
            <tr key={row.role}>
              <th scope="row">{row.role}</th>
              <td>{row.low}</td>
              <td>{row.mid}</td>
              <td>{row.high}</td>
              <td>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
