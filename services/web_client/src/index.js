import * as React from "react";
import * as ReactDOM from "react-dom";
import ManipulateUsers from './components/ManipulateUsers'
import ShowUsersInGroup from './components/ShowUsersInGroup'

const App = () => (
  <>
    <ManipulateUsers />
    <ShowUsersInGroup />
  </>
);


ReactDOM.render(<App />, document.getElementById("app"));
