import * as React from "react";
import * as ReactDOM from "react-dom";

const COMMANDS = {
  ADD_TO_GROUP: 'ADD_TO_GROUP',
  REMOVE_FROM_GROUP: 'REMOVE_FROM_GROUP',
}

const App = () => {
  const [userId, setUserId] = React.useState('qwewqe')
  const issueCommand = async (command, userId) => {
    try {
      await fetch("http://localhost:9001/group/123/456", {
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
      <input value={userId} onChange={React.useCallback(event => setUserId(event.target.value), [userId])} />
      <button onClick={React.useCallback(() => issueCommand(COMMANDS.ADD_TO_GROUP, userId))}>
        Add to group
      </button>
      <button onClick={React.useCallback(() => issueCommand(COMMANDS.REMOVE_FROM_GROUP, userId))}>
        Remove from group
        </button>
    </div>
  );
};


ReactDOM.render(<App />, document.getElementById("app"));
