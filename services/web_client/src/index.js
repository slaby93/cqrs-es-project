import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import ManipulateUsers from './components/ManipulateUsers'
import ShowUsersInGroup from './components/ShowUsersInGroup'
import RestartSystem from './components/RestartSystem'

const App = () => (
  <>
    <Section title="User Manipulation">
      <ManipulateUsers />
    </Section>
    <Section title="Query user friends">
      <ShowUsersInGroup />
    </Section>
    <Section title="Reload events from EventStore">
      <RestartSystem />
    </Section>
  </>
);

const Section = styled(({ className, title, children, }) => (
  <>
    <section className={className}>
      <h1>{title}</h1>
      {children}
    </section>
    <hr/>
  </>
))``


ReactDOM.render(<App />, document.getElementById("app"));
