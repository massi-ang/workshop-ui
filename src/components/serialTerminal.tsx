import {
  Container,
  SpaceBetween,
} from "@cloudscape-design/components";
import ConnectSerialPort from "./configuration";

import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import Xterm from "./xterm-react";

const BUFFER_SIZE = 8 * 1024;

export const SerialTerminal = forwardRef(({ alert }: { alert: (m: string) => void }, ref) => {
  const myTermRef = useRef<any>(null);
  const port = useRef<SerialPort | null>(null);
  const [flushOnEnter] = useState(false);
  const encoder = new TextEncoder();
  const [connected, setConnected] = useState(false);
  let reader:
    | ReadableStreamDefaultReader
    | ReadableStreamBYOBReader
    | undefined;

  useImperativeHandle(ref, () => ({
      writeToPort: writeToPort
    }));

  const runReader = async function () {
    // Keep reading from the port
    console.log("Running reader");
    while (port.current?.readable) {
      try {
        try {
          reader = port.current.readable.getReader({ mode: "byob" });
        } catch {
          reader = port.current.readable.getReader();
        }
        console.log(reader);
        let buffer = null;
        for (;;) {
          const { value, done } = await (async () => {
            if (reader instanceof ReadableStreamBYOBReader) {
              if (!buffer) {
                buffer = new ArrayBuffer(BUFFER_SIZE);
              }
              const { value, done } = await reader.read(
                new Uint8Array(buffer, 0, BUFFER_SIZE)
              );
              buffer = value?.buffer;
              return { value, done };
            } else {
              return await reader.read();
            }
          })();

          if (value) {
            await new Promise<void>((resolve) => {
              if (myTermRef.current)
                myTermRef.current.terminal.write(value, resolve);
            });
          }
          if (done) {
            console.log("Port closed");
            break;
          }
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          alert(e.message);
        }
      } finally {
        if (reader) {
          reader.cancel();
          reader.releaseLock();
          reader = undefined;
        }
      }
    }
    console.log("Port is not readable");
    // If the port is still there close it
    if (port.current) {
      try {
        if (reader) {
          reader.cancel();
          reader = undefined;
        }
        await port.current.close();
      } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          alert(e.message);
        }
      }
    }
  };

  const connectToPort = async function (port: SerialPort) {
    if (port === undefined) return;

    const options = {
      baudRate: 115200,
      dataBits: 8,
      parity: "none" as ParityType,
      stopBits: 1,
      flowControl: "none" as FlowControlType,
      bufferSize: BUFFER_SIZE,
      // Prior to Chrome 86 these names were used.
      baudrate: 115200,
      databits: 8,
      stopbits: 1,
      rtscts: false,
    };
    try {
      console.log("Connecting...");
      await port.open(options);
      console.log("Connected");
      // Assume the connection opens a writeable port
      setConnected(true);
    } catch (e) {
      console.error(e);
      if (port.writable !== null) {
        setConnected(true);
      }
    }
    runReader();
  };

  let toFlush = "";

  const writeToPort = function (data: string) {
    if (port.current?.writable == null) {
      console.warn(`unable to find writable port`);
      return;
    }

    const writer = port.current?.writable.getWriter();

    if (flushOnEnter) {
      toFlush += data;
      if (data === "\r") {
        writer.write(encoder.encode(toFlush));
        writer.releaseLock();
        toFlush = "";
      }
    } else {
      writer.write(encoder.encode(data));
    }

    writer.releaseLock();
  };

  return (
    <Container>
      <SpaceBetween direction="vertical" size="s">
        <SpaceBetween alignItems="center" direction="horizontal" size="s">
        <ConnectSerialPort
          connected={connected}
          onPortSelected={async (p) => {
            console.log("Port selected");
            port.current = p;
            await connectToPort(p);
          }}
          onDisconnect={() => {
            console.log(port);
            if (port.current === undefined) {
              setConnected(false);
            }
            port.current
              ?.close()
              .then(() => {
                setConnected(false);
              })
              .catch((err) => {
                alert(err.message);
              });
          }}
        />
      </SpaceBetween>
      <Xterm
        addons={[new FitAddon()]}
        onData={(data) => {
          writeToPort(data);
        }}
        onBinary={(data) => console.log('bin', data)}
        ref={myTermRef}
      />
      </SpaceBetween>
    </Container>
  );
})
