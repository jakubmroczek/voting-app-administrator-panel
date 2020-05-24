/* globals React */

function IssueRow({ issue }) {
  return (
    <tr>
      <td>{issue.id}</td>
      <td>{issue.status}</td>
      <td>{issue.owner}</td>
      <td>{issue.created.toDateString()}</td>
      <td>{issue.effort}</td>
      <td>{issue.due ? issue.due.toDateString() : ''}</td>
      <td>{issue.title}</td>
    </tr>
  );
}

export default function IssueTable({ issues }) {
  const issuesRow = issues.map(issue => <IssueRow key={issue.id} issue={issue} />);

  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Due date</th>
          <th>Title</th>
        </tr>
      </thead>
      <tbody>
        {issuesRow}
      </tbody>
    </table>
  );
}
