import { Container, Header, SpaceBetween } from "@cloudscape-design/components";
import SendToTerminal from "./send-to-terminal";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

interface IProps {
  title: string;
  description: string;
  actions?: {
    name: string;
    code: string;
    send: (m: string) => void;
  }[];
}

export default function Task(props: IProps) {
  const { title, description, actions } = props;
  return (
    <Container
      header={<Header variant="h2">{title}</Header>}
      footer={
        actions &&
        (actions.map((a) => {
          return (
            <SpaceBetween direction="horizontal" alignItems="end" size="s">
              <SendToTerminal code={a.code} send={a.send}>
                {a.name}
              </SendToTerminal>
            </SpaceBetween>
          );
        }))
      }
    >
      {" "}
      <ReactMarkdown>{description}</ReactMarkdown>{" "}
    </Container>
  );
}
