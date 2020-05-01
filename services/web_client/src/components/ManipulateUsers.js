import * as React from "react";

let interval = null;
const COMMANDS = {
  ADD_TO_GROUP: 'ADD_TO_GROUP',
  REMOVE_FROM_GROUP: 'REMOVE_FROM_GROUP',
}

const ShowUsersInGroup = React.memo(() => {
  const [userId, setUserId] = React.useState('123')
  const [groupId, setGroupId] = React.useState('456')
  const issueCommand = async (command, userId, groupId) => {
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
    <section>
      <div>
        <div>
          <label>GroupID
            <input type="number" value={groupId} onChange={React.useCallback(event => setGroupId(event.target.value), [userId])} />
          </label>
        </div>
        <div>
          <label>UserID
            <input type="number" value={userId} onChange={React.useCallback(event => setUserId(event.target.value), [userId])} />
          </label>
        </div>
      </div>
      <div>
        <button onClick={React.useCallback(() => issueCommand(COMMANDS.ADD_TO_GROUP, userId, groupId))}>
          Add to group
      </button>
        <button onClick={React.useCallback(() => issueCommand(COMMANDS.REMOVE_FROM_GROUP, userId, groupId))}>
          Remove from group
      </button>
        <button onClick={React.useCallback(() => {
          interval = setInterval(() => issueCommand(
            COMMANDS.ADD_TO_GROUP,
            ((Math.random() * 100000)).toFixed(0),
            ((Math.random() * 1000)).toFixed(0)
          ), 10)
        })}>
          Spam random groups
      </button>
        <button onClick={React.useCallback(() => clearInterval(interval))}>
          Stop spam
      </button>
      </div>
    </section>
  )
})

export default ShowUsersInGroup