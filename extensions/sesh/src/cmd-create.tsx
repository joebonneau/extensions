import { useState, useEffect } from "react";

import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { getSessions } from "./sesh";

export default function Command() {
  const [zoxideResults, setZoxideResults] = useState<Array<string>>([]);
  const [path, setPath] = useState<string>("");
  const [args, setArgs] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  async function getAndSetZoxideResults() {
    try {
      const zoxideResults = await getSessions("--zoxide");
      setZoxideResults(zoxideResults);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Couldn't get zoxide results",
        message: typeof error === "string" ? error : "Unknown reason",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await getAndSetZoxideResults();
    })();
  }, []);

  function CustomCreateCommand({ session, args }: { session: string; args: string }) {
    return (
      <ActionPanel>
        <Action.CreateQuicklink
          quicklink={{
            link: `raycast://extensions/joshmedeski/sesh/cmd-connect?arguments=${encodeURIComponent(
              JSON.stringify({ session: session, args: args })
            )}`,
          }}
        />
      </ActionPanel>
    );
  }

  return (
    <Form isLoading={isLoading} actions={zoxideResults && <CustomCreateCommand session={path} args={args} />}>
      <Form.Dropdown id="path" title="Session Path" onChange={setPath}>
        {zoxideResults &&
          zoxideResults.map((path, i) => {
            return <Form.Dropdown.Item key={i} value={path} title={path} />;
          })}
      </Form.Dropdown>
      <Form.TextField
        id="arguments"
        title='Arguments for "sesh connect --switch"'
        defaultValue=""
        onChange={setArgs}
        info='The "--switch" flag is passed by default, so do not include this.'
        placeholder='--command "echo hello"'
      />
    </Form>
  );
}
