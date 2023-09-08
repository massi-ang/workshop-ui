import { Button } from "@cloudscape-design/components";

export default function ConnectSerialPort({
  connected,
  onDisconnect,
  onPortSelected,
}: {
  connected: boolean;
  onDisconnect: () => void;
  onPortSelected: (port: SerialPort) => void;
}) {
  return (
    <Button
      onClick={async () => {
        if (connected) {
          onDisconnect();
        } else {
          try {
            const serial = navigator.serial;
            let port = await serial.requestPort({});
            console.log(port);
            onPortSelected(port);
          } catch (e) {
            return;
          }
        }
      }}
    >
      {connected ? "Disconnect" : "Connect"}
    </Button>
  );
}
