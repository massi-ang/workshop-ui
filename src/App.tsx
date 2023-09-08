import "@cloudscape-design/global-styles/index.css";
import {
  Container,
  ColumnLayout,
  ProgressBar,
} from "@cloudscape-design/components";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Link from "@cloudscape-design/components/link";
import AppLayout from "@cloudscape-design/components/app-layout";
import Alert from "@cloudscape-design/components/alert";
import { SerialTerminal } from "./components/serialTerminal";
import { useState, useRef } from "react";
import Task from "./components/task";

export default function Home() {
  const [alert, setAlert] = useState("");
  const serialTermRef = useRef();

  const sendToTerminal = (m: string) => {
    serialTermRef.current?.writeToPort(`${m}\r\n`);
  };

  return (
    <AppLayout
      navigationHide={true}
      notifications={
        alert.length > 0 && <Alert statusIconAriaLabel="Warning">{alert}</Alert>
      }
      content={
        <ContentLayout
          header={
            <SpaceBetween size="m">
              <Header
                info={<Link>info</Link>}
                description="An awesome IoT workshop"
              >
                AWS IoT Demo Badge Workshop
              </Header>
            </SpaceBetween>
          }
        >
          <ColumnLayout columns={2}>
            <Container>
              <SpaceBetween size="m">
                <ProgressBar
                  value={36}
                  additionalInfo="Additional information"
                  description="Your progress in the workshop"
                  label=""
                />

                <Task
                  title="Print"
                  description="This is a *normal* `python` terminal in which **you can print** what you want
              
* We render MarkDown too
* as you wished"
                  actions={[
                    {
                      code: "print('Jello')",
                      send: sendToTerminal,
                      name: "Print",
                    },
                  ]}
                />

                <Task
                  title="Sum of 2 numbers"
                  description="In python you can also do some maths, like adding 2 numbers: 1 + 5 = ?"
                  actions={[
                    { code: "1 + 5", send: sendToTerminal, name: "1 + 5" },
                    {
                      code: "12327 + 9732",
                      send: sendToTerminal,
                      name: "12327 + 9732",
                    },
                  ]}
                />
              </SpaceBetween>
            </Container>
            <SpaceBetween direction="vertical" size="m">
              <SerialTerminal alert={(m) => setAlert(m)} ref={serialTermRef} />
            </SpaceBetween>
          </ColumnLayout>
        </ContentLayout>
      }
    ></AppLayout>
  );
}
