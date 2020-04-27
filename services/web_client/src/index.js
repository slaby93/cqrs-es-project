import * as React from "react";
import * as ReactDOM from "react-dom";

const COMMANDS = {
  ADD_TO_GROUP: 'ADD_TO_GROUP',
  REMOVE_FROM_GROUP: 'REMOVE_FROM_GROUP',
}

const App = () => {
  const [userId, setUserId] = React.useState('123')
  const [groupId, setGroupId] = React.useState('456')
  const issueCommand = async (command) => {
    try {
      await fetch(`http://localhost:9001/group/${groupId}/${userId}`, {
        method: command === COMMANDS.ADD_TO_GROUP ? 'POST' : 'DELETE',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      throw error
    }
  }
  return (
    <div>
      <section>
        <div>
          <label>GroupID
            <input value={groupId} onChange={React.useCallback(event => setGroupId(event.target.value), [userId])} />
          </label>
        </div>
        <div>
          <label>UserID
            <input value={userId} onChange={React.useCallback(event => setUserId(event.target.value), [userId])} />
          </label>
        </div>
      </section>

      <button onClick={React.useCallback(() => issueCommand(COMMANDS.ADD_TO_GROUP))}>
        Add to group
      </button>
      <button onClick={React.useCallback(() => issueCommand(COMMANDS.REMOVE_FROM_GROUP))}>
        Remove from group
        </button>
    </div>
  );
};


ReactDOM.render(<App />, document.getElementById("app"));
