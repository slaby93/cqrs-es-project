import * as React from "react";
import styled from "styled-components"

const fetchUserFriends = async () => {
  //TODO query ReadModel for groups
  return { "test": true }
}

const ShowUsersInGroup = ({ className }) => {
  const [userId, setUserId] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState({})
  const onChange = React.useCallback((event) => setUserId(event?.target?.value), [userId])
  const onClick = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchUserFriends(userId)
      setData(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [userId, loading])
  return (
    <section className={className}>
      {loading && <span>loading</span>}
      {!loading && (
        <label>
          UserID
          <input type="number" value={userId} onChange={onChange} />
        </label>
      )}
      <button onClick={onClick}>
        Search
      </button>
      <textarea readOnly value={JSON.stringify(data)} />
    </section>
  )
}

const Styled = styled(ShowUsersInGroup)`
  display: flex;
  flex-direction: column;
  margin-top: 50px;
`

export default React.memo(Styled)